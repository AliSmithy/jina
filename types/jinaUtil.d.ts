export class jinaUtil {
    static confirm(msg: any, title?: string, ok?: string, cancel?: string): any;
    static notify(msg: any, type?: string): void;
    static setupPopup(opt: any, actions: any): any;
    static formValidate(form: any): any;
    static sleep: (t: any) => any;
    static isEmptyObject: (t: any) => boolean;
    static getJSON: (url: any, data: any) => any;
    static postJSON: (url: any, data: any) => any;
    static deleteJSON: (url: any, data: any) => any;
    static postMultipart: (url: any, data: any) => any;
}
