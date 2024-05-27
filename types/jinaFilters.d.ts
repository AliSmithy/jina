export class jinaFilters {
    static simpleFilter: {
        new (options?: {
            defaultValue: any;
            onSet: any;
        }): {
            _val: any;
            onSet: any;
            val: any;
        };
    };
    static lookupFilter: {
        new (params: any, onSet: any): {
            _params: any;
            _onSet: any;
            readonly params: any;
            _val: any;
            onSet: any;
            val: any;
        };
    };
}
