class AutofilerRule {
    name: string = "";
    purgeTimeoutSec: number = 0;
    purgeTimeoutDays: number = 0;
    basefolders: string[] = [];
    archival: string = "";
    upperLimit: number = 0;
    lowerLimit: number = 0;
    time: string = "";
    enabled: boolean = true;
    interval: string = "";
    archTimeout: number = 0;
    archTimeoutDays: number = 0;
    purgeActive: string = "";
    maxRffQueue: number = 0;
    rffMaxArchTimeout: number = 0;
    enableStatecheck: string = "";
    minimum: string = "";

    //Constructor
    constructor(id : string) {
        this.name = id;
    }

    set(field: string, value: string) {
        //console.log("Setting field: " + field + " to: " + value);

        if (field === "interval") {
            this.interval = value;
        }
        if (field === "time") {
            this.time = value;
        }
        else if ((field === "enable")) {
            this.enabled = !!value;
        }
        else if ((field === "purge_timeout")) {
            this.purgeTimeoutSec = Number(value);
            this.purgeTimeoutDays = Math.round(Number(value) / (24.0 * 60.0 * 60.0) * 10) / 10;
        }
        else if ((field === "archival")) {
            this.archival = value;
        }
        else if ((field === "lower_limit")) {
            this.lowerLimit = Number(value);
        }
        else if ((field === "upper_limit")) {
            this.upperLimit = Number(value);
        }
        else if ((field === "base_folder_ids")) {
            try {
                value = value.replace(",", " ");
                var temp = value.split(" ");
                this.basefolders = temp;
            }
            catch (Exception) {
                this.basefolders = [];
            }
        }

        //auto_archive rules
        else if ((field === "arch_timeout")) {
            this.archTimeout = Number(value);
            this.archTimeoutDays = Math.round(Number(value) / (24.0 * 60.0 * 60.0) * 10) / 10;
        }
        else if ((field === "purge")) {
            this.purgeActive = value;
        }
        else if ((field === "max_rff_queue")) {
            this.maxRffQueue = Number(value);
        }
        else if ((field === "rff_max_arch_timeout")) {
            this.rffMaxArchTimeout = Number(value);
        }
        else if ((field === "enableStatecheck")) {
            this.enableStatecheck = value;
        }
        else if ((field === "minimum")) {
            this.minimum = value;
        }
    }

    public SayHello() {
        console.log("Hello! I am rule " + this.name);
    }

    public CreateTableRow() {
        var properties = Object.getOwnPropertyNames(this);

        var row: HTMLTableRowElement = document.createElement('tr');

        for (var propRef in properties) {
            var property = properties[propRef];
            var cell = row.insertCell(propRef);

            if (this[property] == 0) {
                cell.innerHTML = "";
            }
            else {
                cell.innerHTML = this[property];
            }
        }
        return row;
    }
}
