export class jinaUtil {
    static confirm(msg: string, title?: string, ok?: string, cancel?: string): any;
    static notify(msg: string, type?: string): void;
    static setupPopup(opt: any, actions: any): any;
    /** کنترل ورود صحیح اطلاعات */
    static formValidate(form: any): any;
    static sleep: (t: any) => any;
    static isEmptyObject: (o: object) => boolean;
    static getJSON: (url: string, data: object) => any;
    static postJSON: (url: string, data: object) => any;
    static deleteJSON: (url: string, data: object) => any;
    static postMultipart: (url: string, data: object) => any;
}
