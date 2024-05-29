export class jinaGrid {
    static toolbarButton: (icon: any, text: any, fn: any, option?: {}) => {
        location: string;
        widget: string;
        options: {
            icon: any;
            onClick: any;
            text: any;
        };
    };
    constructor(id: any, options: any);
    opt: {
        ajax: any;
        grid: any;
        popup: any;
    };
    grid: any;
    popup: any;
    form: any;
    store: any;
    id: any;
    clearDataSource(): void;
    setDataSource(): any;
    createPopupTemplate(formData: any): () => any;
    init(): void;
    saveData(data: any): any;
    removeData(data: any): any;
    #private;
}
