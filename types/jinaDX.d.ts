export class jinaDX {
    static requiredText: string;
    static DropDownTypes: {
        tree: (e: any) => any;
    };
    static widget: {
        new (): {};
        jinaGeneral(widget: any, options?: {}): {
            location: string;
            widget: any;
            options: {};
        };
        jinaLookup(title: any, query: any, options?: {}): {
            location: string;
            widget: string;
            options: {
                placeholder: any;
                displayExpr: string;
                displayValue: string;
                dataSource: any;
            };
        };
        jinaDropDown(title: any, query: any, type: any, options?: {}): {
            location: string;
            widget: string;
            locateInMenu: boolean;
            options: {
                dataSource: any;
                contentTemplate: any;
                placeholder: any;
                valueExpr: string;
                displayExpr: string;
                displayValue: string;
                showClearButton: boolean;
            };
        };
    };
    static editor: {
        new (): {};
        jinaButton(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                text: any;
                rtlEnabled: boolean;
            };
            editorType: string;
        };
        jinaTextBox(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                rtlEnabled: boolean;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaSelectBox(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                deferRendering: boolean;
                placeholder: string;
                displayExpr: string;
                valueExpr: string;
                searchEnabled: boolean;
                searchMode: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        _jinaLookupBase(editorType: any, title: any, query: any, options: any): any;
        jinaLookup(title: any, query: any, options: any): any;
        jinaLookup2(title: any, fieldName: any, filterItem: any, options?: {}): any;
        jinaDropDown(title: any, query: any, drpType: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                dataSource: any;
                contentTemplate: any;
                deferRendering: boolean;
                placeholder: string;
                displayExpr: string;
                valueExpr: string;
                searchEnabled: boolean;
                searchMode: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaNumberBox(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                format: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaRadioGroup(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                layout: string;
                valueExpr: string;
                displayExpr: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaRadioGroup2(title: any, fieldName: any, items: any, options?: {}): {
            editorOptions: {
                layout: string;
                valueExpr: string;
                displayExpr: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaDateBox(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                mask: string;
                useMaskedValue: boolean;
                showDropDownButton: boolean;
                maskRules: {
                    x: RegExp;
                    z: RegExp;
                    y: RegExp;
                    M: RegExp;
                    m: RegExp;
                    D: RegExp;
                    d: RegExp;
                };
                maskInvalidMessage: string;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
            validationRules: {
                type: string;
                pattern: string;
                message: string;
            }[];
        };
        jinaDateBox_old(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                pickerType: string;
                type: string;
                useMaskBehavior: boolean;
                showDropDownButton: boolean;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaTreeList(options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                keyExpr: string;
                parentIdExpr: string;
                allowColumnResizing: boolean;
                columnResizingMode: string;
                hoverStateEnabled: boolean;
                autoExpandAll: boolean;
                showRowLines: boolean;
                selection: {
                    mode: string;
                };
                noDataText: string;
                sorting: {
                    mode: string;
                };
            };
            editorType: string;
        };
        jinaDataGrid(options?: {
            toolbarItems: any[];
            popup: any;
            editorOptions: {};
        }): {
            editorOptions: {
                onInitialized: (e: any) => void;
                showBorders: boolean;
                allowColumnReordering: boolean;
                noDataText: string;
                loadPanel: {
                    text: string;
                };
                columnAutoWidth: boolean;
                rtlEnabled: boolean;
                hoverStateEnabled: boolean;
                selection: {
                    mode: string;
                };
                toolbar: {
                    visible: boolean;
                    items: any[];
                };
                editing: {
                    mode: string;
                    allowUpdating: boolean;
                    allowAdding: boolean;
                    allowDeleting: boolean;
                    useIcons: boolean;
                };
                showColumnLines: boolean;
                showRowLines: boolean;
                onRowDblClick: (e: any) => void;
            };
            toolbarItems: any[];
            popup: any;
            editorType: string;
        };
        jinaFileUploader(options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                uploadMode: string;
                selectButtonText: string;
                labelText: string;
                maxFileSize: number;
                invalidMaxFileSizeMessage: string;
                allowedFileExtensions: string[];
                invalidFileExtensionMessage: string;
                readyToUploadMessage: string;
                uploadAbortedMessage: string;
                uploadFailedMessage: string;
                uploadedMessage: string;
            };
            editorType: string;
        };
        jinaHTMLEditor(options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                valueType: string;
                imageUpload: {
                    fileUploadMode: string;
                    tabs: string[];
                    mediaResizing: {
                        enabled: boolean;
                    };
                    fileUploaderOptions: {
                        selectButtonText: string;
                        labelText: string;
                        maxFileSize: number;
                        invalidMaxFileSizeMessage: string;
                        allowedFileExtensions: string[];
                        invalidFileExtensionMessage: string;
                        readyToUploadMessage: string;
                        uploadAbortedMessage: string;
                    };
                };
                toolbar: {
                    items: (string | {
                        name: string;
                        options: {
                            hint: string;
                            placeholder?: undefined;
                        };
                        visible: boolean;
                        acceptedValues?: undefined;
                    } | {
                        name: string;
                        options: {
                            hint: string;
                            placeholder?: undefined;
                        };
                        visible?: undefined;
                        acceptedValues?: undefined;
                    } | {
                        name: string;
                        acceptedValues: string[];
                        options: {
                            placeholder: string;
                            hint?: undefined;
                        };
                        visible?: undefined;
                    })[];
                };
            };
            editorType: string;
        };
        jinaCaptcha(options: any): any;
        jinaTextArea(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {
                rtlEnabled: boolean;
            };
            label: {
                text: any;
                alignment: string;
            };
            editorType: string;
        };
        jinaCheckBox(title: any, options?: {
            editorOptions: {};
        }): {
            editorOptions: {};
            editorType: string;
            label: {
                text: any;
                alignment: string;
            };
        };
        jinaTagBox(title: any, query: any, options: any): any;
    };
}
