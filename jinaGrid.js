import { jinaUtil } from "./jinaUtil.js"

export class jinaGrid {
  opt; grid; popup; form; store; id;

  constructor(id, options) {
    this.id = id;
    this.opt = {
      ajax: {
        save: { url: "/", onBeforeSave: undefined, onAfterSave: undefined },
        list: { url: "/", onBeforeLoad: undefined, onAfterLoad: undefined, storeConfig: {} },
        remove: { url: "/" },
        ...options.ajax
      },
      grid: { showRowNumber: false, ...options.grid },
      popup: { title: "", width: "400", height: "auto", onBeforePopup: undefined, onAfterPopup: undefined, ...options.popup },
    };
    this.init();
    this.#setupGrid(this.opt.grid);
    this.#setupPopup();
  }
  clearDataSource() {
    this.grid.option("dataSource", []);
  }
  setDataSource() {
    this.grid.option("dataSource", this.store);
    return this.grid;
  }
  createPopupTemplate(formData) {
    return () => {
      let _formDiv = $("<div>").dxForm({
        formData: formData,
        showColonAfterLabel: true,
        items: this.opt.popup.items,
        ...this.opt.popup.form
      });
      this.form = _formDiv.dxForm("instance");
      return _formDiv;
    }
  }

  init() {
    const self = this;
    this.store = new DevExpress.data.CustomStore({
      // key: 'ID',
      // byKey(key) {
      //   return;
      // },
      ...this.opt.ajax.list.storeConfig,
      load(loadOptions) {
        if (self.opt.ajax.list.onBeforeLoad?.() == false)
          return;    
        const d = $.Deferred();
        const args = {};
        [
          'skip',
          'take',
          // 'requireTotalCount',
          'requireGroupCount',
          'sort',
          'filter',
          'totalSummary',
          'group',
          'groupSummary',
        ].forEach((i) => {
          if (i in loadOptions && loadOptions[i] != undefined) {
            args[i] = JSON.stringify(loadOptions[i]);
          }
        });
        if (self.opt.ajax.list?.url)
          jinaUtil.getJSON(self.opt.ajax.list.url, { ...args, ...self.opt.ajax.list.args }).then(ret => {
            self.opt.ajax.list.onAfterLoad?.(ret);
            d.resolve(ret.data.rows, {
              totalCount: ret.data.count,
            });
          });
        else
          d.resolve([], { totalCount: 0 });
        return d.promise();
      }
    });
  }

  #setupGrid(option) {
    let _toolbarItems = [];
    // const _btn = (icon, fn) => { return { location: 'after', widget: 'dxButton', options: { icon: icon, onClick: fn } }; };

    const i = {
      "plus": () => {
        _toolbarItems.push(jinaGrid.toolbarButton("plus", null, function (e) {
          this.#showPopup(true, {});
        }.bind(this)));
      },
      "trash": () => {
        _toolbarItems.push(jinaGrid.toolbarButton("trash", null, function (e) {
          if (this.grid.getSelectedRowsData()[0] != undefined) {
            jinaUtil.confirm("آیا از حذف اطمینان دارید؟").then(x => {
              if (x) {
                let data = this.grid.getSelectedRowsData()[0];
                this.removeData(data).then(ret => {
                  this.grid.refresh();
                  this.popup.hide();
                });
              }
            });
          } else
            jinaUtil.notify("هیچ رکوردی انتخاب نشده", "warning");
        }.bind(this)));
      },
      "edit": () => {
        _toolbarItems.push(jinaGrid.toolbarButton("edit", null, function (e) {
          if (this.grid.getSelectedRowsData()[0] != undefined)
            this.#showPopup(false, this.grid.getSelectedRowsData()[0]);
          else
            jinaUtil.notify("هیچ رکوردی انتخاب نشده", "warning");
        }.bind(this)))
      },
      "save": () => {
        _toolbarItems.push(jinaGrid.toolbarButton("save", null, null));
      }
    };
    if (option.export?.enabled == true)
      _toolbarItems.push({ name: "exportButton", location: 'before' });

    for (const prop of option.toolbarItems) {
      if (i[prop] != null)
        i[prop]();
      else {
        _toolbarItems.push(prop);
      }
    }

    if (option.groupPanel?.visible)
      _toolbarItems.push("groupPanel");
    let _opt = {
      dataSource: this.store,
      showBorders: true,
      allowColumnReordering: true,
      noDataText: "بدون داده",
      loadPanel: { text: "بارگزاری" },
      // keyExpr: 'ID',
      keyboardNavigation: {
        enterKeyAction: 'startEdit',
        enterKeyDirection: 'row',
        editOnKeyPress: true,
      },
      onRowDblClick: function (e) {
        // e.event.preventDefault();
        if (this.grid.getSelectedRowsData()[0] != undefined)
          this.#showPopup(false, this.grid.getSelectedRowsData()[0]);
      }.bind(this),
      allowColumnResizing: true,
      // ColumnResizeMode: "widget",
      columnAutoWidth: true,
      rtlEnabled: true,
      hoverStateEnabled: true,
      selection: { mode: 'single' },
      toolbar: {
        visible: _toolbarItems.length > 0,
        items: _toolbarItems
      },
      editing: {
        mode: 'popup',
        allowUpdating: false,
        allowAdding: false,
        allowDeleting: false,
        useIcons: true,
      },
      paging: {
        pageSize: 50,
        pageIndex: 0  // Shows the second page
      },
      pager: {
        // showPageSizeSelector: true,
        // allowedPageSizes: [10, 20, 50],
        showNavigationButtons: true
      },
      showColumnLines: true,
      showRowLines: true,
      columnChooser: {
        title: "انتخاب ستون",
        emptyPanelText: "ستونها را اینجا بیاندازید",
        mode: "select",//"dragAndDrop",
        enabled: option.uniqueStorageID != undefined,
        selection: {
          allowSelectAll: true
        }
      },
      grouping: {
        autoExpandAll: true,
      },
      remoteOperations: {
        paging: false,//طبق داکیومنت اگر این گزینه تنظیم باشد حتما باید فیلترینگ و سورتینگ هم تنظیم باشند
        filtering: false,
      },
      onExporting: function (e) {
        var workbook = new ExcelJS.Workbook();
        var worksheet = workbook.addWorksheet('جدول');
        DevExpress.excelExporter.exportDataGrid({
          worksheet: worksheet,
          component: e.component,
          customizeCell: function (options) {
            options.excelCell.font = { name: 'Arial', size: 12 };
            options.excelCell.alignment = { horizontal: 'left' };
          }
        }).then(function () {
          workbook.xlsx.writeBuffer().then(function (buffer) {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'export.xlsx');
          });
        });
      },
      ...option,
      groupPanel: {
        emptyPanelText: "ستون‌ها را اینجا بیاندازید",
        visible: true,
        ...option.groupPanel
      },
      export: {
        texts: {
          exportAll: "خروجی Excel"
        },
        ...option.export
      },
      filterRow: {
        showAllText: "همه",
        operationDescriptions: {
          contains: "شامل",
          notContains: "غیر شامل",
          startsWith: "ابتدای متن",
          endsWith: "انتهای متن",
          equal: "برابر",
          notEqual: "نا برابر",
        },
        resetOperationText: "پاک کردن فیلتر",
        ...option.filterRow
      },
      stateStoring: {
        enabled: option.uniqueStorageID != undefined,
        type: "custom",//'localStorage',
        storageKey: option.uniqueStorageID,//'storage',
        items: [],
        customLoad: function () {
          var state = localStorage.getItem(this.storageKey);
          state = JSON.parse(state);
          return state;
        },
        customSave: function (state) {
          let _colState = state.columns.map(x => {
            delete x.filterValue; //چون نمیخواهم که فیلتر ذخیره شود
            return x;
          });
          let _state = { columns: _colState };
          for (let i of this.items) {
            _state[i] = state[i];
          }
          localStorage.setItem(this.storageKey, JSON.stringify(_state));
        },
        ...option.stateStoring
      },
      onEditorPrepared: function (info) {
        if ((info.parentType === 'filterRow') && (info.editorName === "dxSelectBox")
        ) {
          // info.showAllText = "(Tudo)";
          info.trueText = "بله";
          info.falseText = "خیر";
        }
      }
    };
    // _opt = { ..._opt, ...option };
    if (_opt.showRowNumber == true)
      _opt.columns = [{
        caption: '#', width: 30, allowEditing: false,
        cellTemplate: (cellElement, cellInfo) => {
          cellElement.text(cellInfo.row.rowIndex + 1);
        }
      }, ..._opt.columns];
    this.grid = $(this.id).dxDataGrid(_opt).dxDataGrid("instance");
  }
  #setupPopup() {
    this.popup = jinaUtil.setupPopup(this.opt.popup, {
      save: () => {
        // if (this.opt.ajax.save.onBeforeSave != undefined && this.opt.ajax.save.onBeforeSave(this.popup.data) == false)
        if (this.opt.ajax.save.onBeforeSave?.(this.popup.data) == false)
          return;
        else this.saveData(this.popup.data).then(ret => {
          if (ret.success == true) {
            this.grid.refresh(true);
            this.popup.hide();
          }
        });
      }
    });
  }
  #showPopup(isNewRecord, data) {
    if (this.opt.popup.onBeforePopup?.(data) == false)
      return;
    const self = this;
    let _data = structuredClone(data);
    this.popup.data = _data;
    this.popup.option({
      title: isNewRecord ? `${this.opt.popup.title} (جدید)` : `${this.opt.popup.title} (ویرایش)`,
      contentTemplate: () => {
        let _formDiv = $("<div>").dxForm({
          formData: _data,
          showColonAfterLabel: true,
          items: this.opt.popup.items,
          ...this.opt.popup.form
        });
        this.form = _formDiv.dxForm("instance");
        this.popup.form = this.form;
        return _formDiv;
      },
      // visible: true
    });
    if (this.popup.option("onShown") == null)
      this.popup.option("onShown", e => {
        this.opt.popup.onAfterPopup?.(_data);
      });
    this.popup.show();
  }

  saveData(data) {
    let self = this;
    return jinaUtil.postJSON(this.opt.ajax.save.url, data).then(async ret => {
      if (self.opt.ajax.save.onAfterSave?.(ret) == false)
        return;
      jinaUtil.notify(ret.message, ret.success == true ? "success" : "error");
      if (ret.warning != undefined)
        jinaUtil.notify(ret.warning, "warning");
      return ret;
    });
  }
  removeData(data) {
    return jinaUtil.deleteJSON(this.opt.ajax.remove.url, data).then(async ret => {
      jinaUtil.notify(ret.message, ret.success == true ? "success" : "error");
    });
  }
  static toolbarButton = (icon, text, fn, option = {}) => {
    return {
      location: 'after', widget: 'dxButton', options:
      {
        icon: icon, onClick: fn, text: text, ...option
      }
    };
  };
}
