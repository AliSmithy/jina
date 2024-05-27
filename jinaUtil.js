export class jinaUtil {
  static confirm(msg, title = "پرسش", ok = "تایید", cancel = "انصراف") {
    var customDialog = DevExpress.ui.dialog.custom({
      rtlEnabled: true,
      title: title,
      messageHtml: `<div style="direction:rtl">${msg}</div>`,
      buttons: [
        { text: ok, onClick: function () { return true } },
        { text: cancel, onClick: function () { return false } }
      ]
    });
    return customDialog.show();
  }
  static notify(msg, type = "info") {
    DevExpress.ui.notify({
      message: msg,
      // minHeight: 45,
      // height: "auto",
      width: "280" | "auto",
      // minWidth: "250" | "auto",
      type: type,
      displayTime: 7000,
      rtlEnabled: true,
      animation: {
        show: { type: 'fade', duration: 400, from: 0, to: 1 },
        hide: { type: 'fade', duration: 400, from: 1, to: 0 },
      },
    }, {
      position: "bottom left",
      direction: "up-push",
    });
  }
  static setupPopup(opt, actions) {
    let _div = $("<div>");
    $("body").append(_div);
    let _p = _div.dxPopup(
      {
        rtlEnabled: true,
        hideOnOutsideClick: true,
        showTitle: true,
        width: opt.width,
        height: opt.height,
        // deferRendering: false,
        toolbarItems: [
          {
            widget: "dxButton",
            location: "after",
            toolbar: "bottom",
            options: {
              text: "تایید",
              onClick: function () {
                if (actions.onBeforeSave != undefined && actions.onBeforeSave() == false)
                  return;
                let _validate = _p.form?.validate();
                if (_validate != undefined && _validate.isValid == false) {
                  jinaUtil.notify("خطاها را اصلاح کنید", "error");
                  return;
                }
                if (opt.askSave == true)
                  jinaUtil.confirm("آیا از ذخیره اطلاعات اطمینان دارید؟").done(x => {
                    if (x)
                      actions.save();
                  });
                else
                  actions.save();
              },
              ...opt.saveKey
            },
          }
        ],
        onDisposing: function (e) {
          _div.remove();
        },
        ...opt.options
      }).dxPopup("instance");
    return _p;
  }
  /** کنترل ورود صحیح اطلاعات */
  static formValidate(form) {
    return new Promise((resolve, reject) => {
      let _formValidate = form.validate();
      if (_formValidate != undefined && _formValidate.isValid == false) {
        jinaUtil.notify("خطاها را اصلاح کنید", "error");
        reject("خطای اطلاعات فرم");
      } else
        resolve();
    })
  }
  static sleep = (t) => new Promise(resolve => setTimeout(resolve, t));

  static #generalJSON = function (type, url, data) {
    return $.ajax({
      type: type,
      url: url,
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: (type == "GET") ? data : $.isEmptyObject(data) ? null : JSON.stringify(data)
    }).fail(err => {
      if (err.status == 409)//customError
        jinaUtil.notify(err.responseJSON.message, "error");
      else if (err.status == 401) {//permission denied
        jinaUtil.notify("خطای دسترسی; دوباره وارد شوید", "error");
        setTimeout(() => { window.location = "/user/login" }, 1000);
      } else
        jinaUtil.notify(`خطای ناشناخته: کد ${err.status}`, "error");
    });
  };

  static getJSON = (url, data) => this.#generalJSON("GET", url, data);
  static postJSON = (url, data) => this.#generalJSON("POST", url, data);
  static deleteJSON = (url, data) => this.#generalJSON("DELETE", url, data);

  static postMultipart = function (url, data) {
    return $.ajax({
      type: "POST",
      url: url,
      contentType: false,
      processData: false,
      data: data
    }).fail(err => {
      if (err.status == 409)//customError
        jinaUtil.notify(err.responseJSON.message, "error");
      else if (err.status == 401) {//permission denied
        jinaUtil.notify("خطای دسترسی; دوباره وارد شوید", "error");
        setTimeout(() => { window.location = "/user/login" }, 1000);
      } else
        jinaUtil.notify(`خطای ناشناخته: کد ${err.status}`, "error");
    });
  };
}