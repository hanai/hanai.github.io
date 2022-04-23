(function () {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const XLSX = window.XLSX;
  const { Button, Input, Form, Select, Checkbox } = window.antd;

  const { Option } = Select;
  const { createElement: h, useState, useRef, Fragment } = React;

  const FileInput = (props) => {
    const { onFileLoad } = props;

    const onChange = (e) => {
      if (e.target.files && e.target.files.length) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          var data = new Uint8Array(e.target.result);
          onFileLoad(data);
        };
        reader.readAsArrayBuffer(file);
      }
    };

    return h(Input, {
      type: "file",
      accept: ".xlsx",
      onChange: onChange,
    });
  };

  const SheetSelection = (props) => {
    const { onSelectSheet, sheets, disabled } = props;
    return h(
      Select,
      {
        disabled: disabled,
        onChange: onSelectSheet,
        placeholder: "Select Sheet",
      },
      sheets.map((sheet) => h(Option, { key: sheet }, sheet))
    );
  };

  const Config = (props) => {
    const { value, onChange } = props;

    const onCheckboxChange = (key, e) => {
      onChange({
        ...value,
        [key]: e.target.checked,
      });
    };

    return h(
      Fragment,
      null,
      Object.keys(value).map((key) => {
        return h(
          Checkbox,
          {
            onChange: onCheckboxChange.bind(null, key),
            checked: value[key],
          },
          key
        );
      })
    );
  };

  const App = () => {
    const [sheetNames, setSheetNames] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState(null);
    const resultContainerRef = useRef(null);
    const [tableHtml, setTableHtml] = useState("");
    const [config, setConfig] = useState({
      trim: false,
      thead: false,
    });
    const [workbook, setWorkbook] = useState(null);

    const onFileLoad = (buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      setWorkbook(workbook);
      setSheetNames(workbook.SheetNames);
    };

    const handleSelectSheet = (sheet) => {
      setSelectedSheet(sheet);
      console.log(
        XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
          header: 1,
          raw: false,
        })
      );
      const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheet], {
        header: "",
        footer: "",
      });
      setTableHtml(html);
    };

    const handleClickCopyButton = () => {
      navigator.clipboard.writeText(tableHtml).then(
        function () {
          /* clipboard successfully set */
        },
        function () {
          /* clipboard write failed */
        }
      );
    };

    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };

    return h(
      "div",
      null,
      h(
        Form,
        {
          ...formLayout,
        },
        h(
          Form.Item,
          {
            label: "Select File",
          },
          h(FileInput, {
            onFileLoad,
          })
        ),
        h(
          Form.Item,
          {
            label: "Select Sheet",
          },
          h(SheetSelection, {
            disabled: workbook == null,
            sheets: sheetNames,
            onSelectSheet: handleSelectSheet,
          })
        ),
        h(
          Form.Item,
          {
            label: "Config",
          },
          h(Config, {
            value: config,
            onChange: setConfig,
          })
        ),
        h(
          Form.Item,
          {
            ...tailLayout,
          },
          h(
            Button,
            {
              onClick: handleClickCopyButton,
              disabled: selectedSheet == null,
            },
            "Copy HTML"
          )
        )
      ),
      h("div", {
        className: "table-container",
        dangerouslySetInnerHTML: { __html: tableHtml },
      })
    );
  };

  ReactDOM.render(h(App), document.getElementById("app"));
})();
