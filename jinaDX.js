import { jinaGrid } from "./jinaGrid.js";
import { jinaUtil } from "./jinaUtil.js";
import { nedaCalendar } from "/js/nedaCalendar/nedaCalendar.js";

export class jinaDX {
  static requiredText = "وارد نشده";
  static DropDownTypes = {
    tree:
      function (e) {
        const _treeView = $('<div>').dxTreeView({
          noDataText: "<span style='color:gray;font-size:0.9em'>--- بدون داده ---</span>",
          dataSource: e.component.getDataSource(),
          dataStructure: 'plain',
          keyExpr: 'ID',
          parentIdExpr: 'ParentID',
          selectionMode: 'single',
          displayExpr: 'Title',
          selectByClick: true,
          rtlEnabled: true,
          onContentReady(args) {
            // const value = e.component.option('value');
            // syncTreeViewSelection(args.component, value);
          },
          selectNodesRecursive: false,
          onItemSelectionChanged(args) {
            const n = args.component.getSelectedNodes();
            if (!n.length) return;
            const { key, text } = n[0];
            e.component.option({ value: key, title: text });
          },
        });
        e.component.on('valueChanged', (args) => {
          _treeView.dxTreeView('instance').selectItem(args.value);
          e.component.close();
        });

        return _treeView;
      }
  }
  static #lookupDefaultValue = editor => {
    const _onSelectionChanged = editor.onSelectionChanged;
    const _onInitialized = editor.onInitialized;
    editor.onSelectionChanged = e => {
      if (e.selectedItem?.Title == undefined)
        localStorage.removeItem(editor.defaultValueKey);
      else
        localStorage.setItem(editor.defaultValueKey, JSON.stringify({ ID: e.selectedItem?.ID, Title: e.selectedItem?.Title }));
      // const fn = parent => setTimeout(() => { parent != null && parent == undefined ? fn(parent) : _onSelectionChanged?.(e) }, 100);
      // fn(editor.defaultValueKey.parent);
      setTimeout(() => { _onSelectionChanged?.(e) }, 100);
    };
    editor.onInitialized = e => {
      _onInitialized?.(e);
      let _v = JSON.parse(localStorage.getItem(editor.defaultValueKey));
      if (_v)
        e.component.option("value", _v.ID);
    };
    editor.dataSource = {
      byKey: key => {
        let _v = JSON.parse(localStorage.getItem(editor.defaultValueKey));
        if (_v)
          return { ID: _v.ID, Title: _v.Title }
        else
          return { ID: key, Title: key }
      }
    };
  }
  static widget = class {
    static jinaGeneral(widget, options = {}) {
      return {
        location: 'after',
        widget: widget,
        options: {
          ...options
        },
      }
    }
    static jinaLookup(title, query, options = {}) {
      if (options.defaultValueKey)
        jinaDX.#lookupDefaultValue(options);
      return {
        location: 'after',
        widget: 'dxSelectBox',
        options: {
          placeholder: title,
          displayValue: "ID",
          displayExpr: "Title",
          ...options,
          dataSource: new DevExpress.data.CustomStore({
            key: "ID",
            load: function () {
              const d = $.Deferred();
              jinaUtil.getJSON("/lookup_list", query).then(ret => {
                if (ret.success == true)
                  d.resolve(ret.data);
                else
                  d.reject();
              });
              return d.promise();
            },
            ...options.dataSource
          }),
        }
      };
    }
    static jinaDropDown(title, query, type, options = {}) {
      return {
        location: 'after',
        widget: 'dxDropDownBox',
        locateInMenu: false,
        options: {
          placeholder: title,
          valueExpr: "ID",
          displayExpr: "Title",
          displayValue: "ID",
          showClearButton: true,
          ...options,
          dataSource: new DevExpress.data.CustomStore({
            loadMode: 'raw',
            load: function () {
              return jinaUtil.getJSON("/lookup_list", query).then(ret => {
                return ret.data;
              });
            },
            ...options.dataSource
          }),
          contentTemplate: type,
        }
      }
    }
  }
  static editor = class {
    static jinaButton(title, options = { editorOptions: {} }) {
      return {
        editorType: 'dxButton',
        ...options,
        editorOptions: {
          text: title,
          rtlEnabled: true,
          ...options.editorOptions
        },
      }
    }
    static jinaTextBox(title, options = { editorOptions: {} }) {
      if (options.required) {
        if (options.validationRules)
          options.validationRules.push({ type: 'required', message: jinaDX.requiredText });
        else
          options.validationRules = [{ type: 'required', message: jinaDX.requiredText }]
      }
      return {
        editorType: 'dxTextBox',
        ...options,
        editorOptions: {
          rtlEnabled: false,
          ...options.editorOptions,
        },
        label: { text: title, alignment: "left" },
      }
    }
    static jinaSelectBox(title, options = { editorOptions: {} }) {
      return {
        // dataField: field,
        editorType: 'dxSelectBox',
        // validationRules: [{ type: 'required' }],
        ...options,
        editorOptions: {
          deferRendering: true,
          placeholder: `انتخاب ${title}`,
          displayExpr: "Title",
          valueExpr: "ID",
          // items: data.Provinces,
          searchEnabled: true,
          searchMode: "contains",
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" },
      }
    }
    static _jinaLookupBase(editorType, title, query, options) {
      if (!options.editorOptions)
        options.editorOptions = { dataSource: {} };
      if (options.editorOptions.defaultValueKey)
        jinaDX.#lookupDefaultValue(options.editorOptions);
      const _lookup = {
        editorType: editorType,
        ...options,
        editorOptions: {
          rtlEnabled: true,
          onInitialized: function (e) {
            _lookup.component = e.component;
          },
          placeholder: `انتخاب ${title}`,
          noDataText: "<span style='color:gray;font-size:0.9em'>--- بدون داده ---</span>",
          displayExpr: "Title",
          valueExpr: "ID",
          // showClearButton: true,
          searchEnabled: true,
          searchMode: "contains",
          ...options.editorOptions,
          dataSource: new DevExpress.data.CustomStore({
            cacheRawData: true,
            loadMode: 'raw',
            useDefaultSearch: false,
            load: function (loadOptions) {
              if (this._loadMode == "processed")
                /** اگر خواستی هنگام دراپ شدن گزینه منتخب را بعنوان سرچ پیشفرض انتخاب کند بخش کامنت شده زیر را بگذار
                 * این کامنت را به پیشنهاد شیلان.ب انجام دادم که هنگام دراپ شدن فقط یک گزینه انتخاب نشود
                */
                query.quest = loadOptions.searchValue /* ?? _lookup.component.option("text")*/;
              options.editorOptions?.onLoading?.(loadOptions);
              return jinaUtil.getJSON(options.url ?? "/lookup_list", query).then(ret => {
                options.editorOptions?.onLoaded?.(ret);
                if (ret.success == true)
                  return ret.data;
                else
                  jinaUtil.notify(`خطای بارگزاری ${ret.message}`, "error");
              });
            },
            ...options.editorOptions.dataSource
          }),
        },
        label: { text: title, alignment: "left" },
      };
      return _lookup;
    }
    static jinaLookup(title, query, options) {
      return jinaDX.editor._jinaLookupBase('dxSelectBox', title, query, options);
    }
    static jinaLookup2(title, fieldName, filterItem, options = {}) {
      if (options.required) {
        if (options.validationRules)
          options.validationRules.push({ type: 'required', message: jinaDX.requiredText });
        else
          options.validationRules = [{ type: 'required', message: jinaDX.requiredText }];
      }
      return jinaDX.editor.jinaLookup(title, filterItem.params, {
        dataField: fieldName,
        ...options,
        editorOptions: {
          onOpened: (e) => { e.component.getDataSource().reload() },
          onSelectionChanged: (e) => { filterItem.val = e.selectedItem?.ID },
          dataSource: {
            loadMode: "processed",
            byKey: options.byKey
          },
          ...options.editorOptions
        },
      })
    }
    static jinaDropDown(title, query, drpType, options = { editorOptions: {} }) {
      return {
        editorType: 'dxDropDownBox',
        ...options,
        editorOptions: {
          deferRendering: true,
          placeholder: `انتخاب ${title}`,
          displayExpr: "Title",
          valueExpr: "ID",
          // showClearButton: true,
          searchEnabled: true,
          searchMode: "contains",
          ...options.editorOptions,
          dataSource: new DevExpress.data.CustomStore({
            loadMode: 'raw',
            load: function () {
              return jinaUtil.getJSON("/lookup_list", query).then(ret => {
                options.editorOptions.dataSource?.onAjaxLoaded?.(ret.data);
                return ret.data;
              });
            },
            ...options.editorOptions.dataSource
          }),
          contentTemplate: drpType,
        },
        label: { text: title, alignment: "left" },
      }
    }
    static jinaNumberBox(title, options = { editorOptions: {} }) {
      if (options.required) {
        if (options.validationRules)
          options.validationRules.push({ type: 'required', message: jinaDX.requiredText });
        else
          options.validationRules = [{ type: 'required', message: jinaDX.requiredText }]
      }
      return {
        editorType: 'dxNumberBox',
        ...options,
        editorOptions: {
          format: !options.isDecimal ? "#,##0" : "#,##0.##",
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" }
      }
    }
    static jinaRadioGroup(title, options = { editorOptions: {} }) {
      return {
        editorType: 'dxRadioGroup',
        ...options,
        editorOptions: {
          layout: "horizontal",
          valueExpr: 'ID',
          displayExpr: 'Title',
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" }
      }
    }
    static jinaRadioGroup2(title, fieldName, items, options = {}) {
      if (options.required) {
        const _customRequired = {
          type: 'custom', message: jinaDX.requiredText,
          validationCallback(e) { return e.value != undefined }
        };
        if (options.validationRules)
          options.validationRules.push(_customRequired);
        else
          options.validationRules = [_customRequired];
      }
      return jinaDX.editor.jinaRadioGroup(title, {
        dataField: fieldName,
        ...options,
        editorOptions: {
          validationMessagePosition: "right",
          validationMessageMode: "always",
          items: items,
          ...options.editorOptions
        }
      });
    }
    static jinaDateBox(title, options = { editorOptions: {} }) {
      const _validation = [
        {
          type: "pattern",
          pattern: "1[3-4]\\d{2}[0-1]\\d[0-3]\\d",
          message: "قالب تاریخ اشتباه است"
        }
      ];
      if (options.required)
        _validation.push({
          type: "required",
          message: "اجباری"
        });
      let _c = {
        editorType: 'dxTextBox',
        validationRules: _validation,
        ...options,
        editorOptions: {
          mask: "xzyy-Mm-Dd",
          useMaskedValue: false,
          showDropDownButton: false,
          maskRules: { x: /1/, z: /[3-4]/, y: /\d/, M: /[0-1]/, m: /\d/, D: /[0-3]/, d: /\d/ },
          maskInvalidMessage: "تاریخ اشتباه است",
          onInitialized(e) { _c.dateBox = e.component; },
          buttons: [{
            name: 'password',
            location: 'after',
            options: {
              icon: 'event',
              stylingMode: 'text',
              onClick(e) {
                const _input = _c.dateBox.element().find("input[type='text']");
                const _pop = document.createElement("div");
                _pop.className = "ndCal";
                document.body.append(_pop);
                Popper.createPopper(_input[0], _pop);
                let cal = new nedaCalendar(_pop, _c.dateBox.option("text"));
                cal.addEventListener("onSelectDate", event => {
                  _c.dateBox.option("value", event.detail.replace(/-/g, ""));
                });
              },
            },
          }],
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" }
      };
      return _c;
    }
    static jinaDateBox_old(title, options = { editorOptions: {} }) {
      return {
        // dataField: field,
        editorType: 'dxDateBox',
        ...options,
        editorOptions: {
          pickerType: "calendar",
          type: "date",
          useMaskBehavior: true,
          showDropDownButton: false,
          // calendarOptions: {
          //   maxZoomLevel: "month"
          // },
          // format: "#,##0.##",
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" }
      }
    }
    static jinaTreeList(options = { editorOptions: {} }) {
      return {
        editorType: "dxTreeList",
        ...options,
        editorOptions: {
          keyExpr: "ID",
          parentIdExpr: "ParentID",
          allowColumnResizing: true,
          columnResizingMode: "widget",
          hoverStateEnabled: true,
          autoExpandAll: true,
          showRowLines: true,
          selection: { mode: "single" },
          noDataText: "بدون داده",
          sorting: {
            mode: "None"
          },
          ...options.editorOptions
        }
      }
    }
    static jinaDataGrid(options = { toolbarItems: [], popup: null, editorOptions: {} }) {
      let _c, _popup, _popupForm;
      let showPopup = data => {
        if (options.popup.onBeforePopup?.(data) == false)
          return;
        $("<div id='myPopup'>").remove();
        let _div = $("<div id='myPopup'>").appendTo($("#contentDiv"));
        _popup = _div.dxPopup(
          {
            form: null,
            contentTemplate: "<div id='myPopupForm'>",
            rtlEnabled: true,
            hideOnOutsideClick: true,
            showTitle: true,
            width: "500",
            height: "auto",
            visible: true,
            onHidden: (e) => {
              _popup.dispose();
              _div.remove();
              _popupForm = null;
            },
            onContentReady: (e) => {
              _popupForm = $("#myPopupForm").dxForm({
                name: "myForm",
                formData: data,
                labelMode: 'outside',
                rtlEnabled: true,
                items: [...options.popup.items, jinaDX.editor.jinaButton("ذخیره", {
                  cssClass: "d-flex justify-content-center",
                  editorOptions: {
                    icon: "return",
                    type: "success",
                    onClick: async () => {
                      if (options.popup.onSave) {
                        let _formValidate = _popupForm.validate();
                        if (_formValidate != undefined && _formValidate.isValid == false) {
                          jinaUtil.notify("خطاها را اصلاح کنید", "error");
                          return;
                        }
                      }
                      const __ret = await options.popup.onSave?.(_popupForm.option("formData"));
                      if (__ret == false)
                        return;
                      _popup.hide();
                    }
                  }
                })
                ]
              }).dxForm("instance");
            },
            ...options.popup
          }).dxPopup("instance");
      }
      let _toolbarItems = [];
      const i = {
        "plus": () => {
          _toolbarItems.push(jinaGrid.toolbarButton("plus", null, function (e) {

            showPopup({});
          }.bind(this)));
        },
        "edit": () => {
          _toolbarItems.push(jinaGrid.toolbarButton("edit", null, function (e) {
            if (_c.grid.getSelectedRowsData()[0] != undefined) {
              showPopup(_c.grid.getSelectedRowsData()[0]);
            } else
              jinaUtil.notify("هیچ رکوردی انتخاب نشده", "warning");
          }.bind(this)))
        },
      };
      if (options.toolbarItems)
        for (const prop of options.toolbarItems) {
          if (i[prop] != null)
            i[prop]();
          else {
            _toolbarItems.push(prop);
          }
        }
      _c = {
        editorType: "dxDataGrid",
        ...options,
        editorOptions: {
          onInitialized: function (e) {
            _c.grid = e.component;
          },
          showBorders: true,
          allowColumnReordering: true,
          noDataText: "بدون داده",
          loadPanel: { text: "بارگزاری" },
          columnAutoWidth: true,
          rtlEnabled: true,
          hoverStateEnabled: true,
          selection: { mode: 'single' },
          toolbar: {
            visible: _toolbarItems.length > 0,
            items: _toolbarItems
          },
          editing: {
            mode: 'row',
            allowUpdating: false,
            allowAdding: false,
            allowDeleting: false,
            useIcons: true,
          },
          showColumnLines: true,
          showRowLines: true,
          onRowDblClick: function (e) {
            if (_c.grid.getSelectedRowsData()[0] != undefined) {
              showPopup(_c.grid.getSelectedRowsData()[0]);
            }
          },
          ...options.editorOptions,
        }
      }
      return _c;
    }
    static jinaFileUploader(options = { editorOptions: {} }) {
      return {
        editorType: "dxFileUploader",
        ...options,
        editorOptions: {
          uploadMode: "useForm",
          selectButtonText: "انتخاب فایل",
          labelText: "یا اینجا بیاندازید",
          maxFileSize: 500000,//500kb
          invalidMaxFileSizeMessage: "حجم فایل بیش از حد مجاز (بیشترین مقدار مجاز: 500 کیلوبایت)",
          allowedFileExtensions: [".jpg", ".png", ".pdf", ".xlsx"],
          invalidFileExtensionMessage: "نوع فایل غیر مجاز (فایل‌های مجاز: jpg, png, pdf, xlsx)",
          readyToUploadMessage: "آماده ارسال",
          uploadAbortedMessage: "فایل ارسال نشد",
          uploadFailedMessage: "خطای ارسال فایل",
          uploadedMessage: "فایل ارسال شد",
          ...options.editorOptions,
        }
      }
    }
    static jinaHTMLEditor(options = { editorOptions: {} }) {
      return {
        editorType: "dxHtmlEditor",
        ...options,
        editorOptions: {
          valueType: "html",
          imageUpload: {
            fileUploadMode: 'base64',
            tabs: ['file'],
            mediaResizing: {
              enabled: true,
            },
            fileUploaderOptions: {
              selectButtonText: "انتخاب فایل",
              labelText: "عکس را اینجا بیاندازید",
              maxFileSize: 500000,//500kb
              invalidMaxFileSizeMessage: "حجم فایل بیش از حد مجاز (بیشترین مقدار: 500 کیلوبایت)",
              allowedFileExtensions: [".jpg", ".png"],
              invalidFileExtensionMessage: "نوع فایل غیر مجاز (پسوند مجاز: jpg, png)",
              readyToUploadMessage: "آماده ارسال",
              uploadAbortedMessage: "تصویر ارسال نشد"

            }
            // uploadUrl: 'https://js.devexpress.com/Demos/Upload',
            // uploadDirectory: '/Images'
          },
          toolbar: {
            items: [
              { name: 'image', options: { hint: "تصویر" }, visible: false },
              { name: 'bold', options: { hint: "برجسته" } },
              { name: 'color', options: { hint: "انتخاب رنگ" } },
              'separator',
              { name: 'alignLeft', options: { hint: "چپ چین" } },
              { name: 'alignCenter', options: { hint: "وسط چین" } },
              { name: 'alignRight', options: { hint: "راست چین" } },
              'separator',
              {
                name: "size", acceptedValues: ["12pt", "14pt", "18pt", "24pt"],
                options: { placeholder: "اندازه" }
              },
              // 'insertTable', 'insertHeaderRow', 'insertRowAbove', 'insertRowBelow',
              // 'separator', 'insertColumnLeft', 'insertColumnRight',
              // 'separator', 'deleteColumn', 'deleteRow', 'deleteTable',
              // 'separator', 'cellProperties', 'tableProperties',
              // "insertTable",
              // "deleteTable",
              // "insertRowAbove",
              // "insertRowBelow",
              // "deleteRow",
              // "insertColumnLeft",
              // "insertColumnRight",
              // "deleteColumn",
              // "cellProperties",
              // "tableProperties"
            ]
          },
          ...options.editorOptions
        }
      }
    }
    static jinaCaptcha(options) {
      return {
        validationRules: [{ type: 'required', message: jinaDX.requiredText }],
        dataField: options.dataField,
        label: { text: "عبارت امنیتی", visible: true, showColon: false },
        template: function (data, itemElement) {
          var d = `<div><div><img src='/captcha?c=${Date.now()}' class='captcha'/></div></div>`;
          itemElement.append($(d).dxTextBox({
            // value: data.component.option('formData')[data.dataField],
            placeholder: "عبارت امنیتی", width: 222,
            buttons: [{
              name: "refresh", location: "after", options: {
                icon: "refresh", onClick: e => {
                  $("img[class=captcha]").attr("src", `/captcha?c=${Date.now()}`);
                }
              }
            }],
            onValueChanged: function (e) {
              data.component.updateData(data.dataField, e.value);
            },
            // onContentReady: (args) => {
            // }
          }));
        },
        ...options
      };
    }
    static jinaTextArea(title, options = { editorOptions: {} }) {
      if (options.required) {
        if (options.validationRules)
          options.validationRules.push({ type: 'required', message: jinaDX.requiredText });
        else
          options.validationRules = [{ type: 'required', message: jinaDX.requiredText }]
      }
      return {
        editorType: 'dxTextArea',
        ...options,
        editorOptions: {
          rtlEnabled: false,
          ...options.editorOptions,
        },
        label: { text: title, alignment: "left" },
      }
    }
    static jinaCheckBox(title, options = { editorOptions: {} }) {
      return {
        editorType: 'dxCheckBox',
        editorOptions: {
          ...options.editorOptions
        },
        label: { text: title, alignment: "left" },
        ...options,
      }
    }
    static jinaTagBox(title, query, options) {
      return jinaDX.editor._jinaLookupBase('dxTagBox', title, query, { ...options, editorOptions: { ...options.editorOptions, selectAllText: "همه" } });
    }
  }
}
