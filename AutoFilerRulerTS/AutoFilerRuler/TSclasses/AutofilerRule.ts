class AutofilerRule {
    name: string = "";
    purgeTimeoutSec: number = -1;
    purgeTimeoutDays: number = -1;
    basefolderCount: number = 0;
    basefolders: number[] = [];
    archival: string = "";
    upperLimit: number = -1;
    lowerLimit: number = -1;
    time: string = "";
    enabled: boolean = true;
    interval: string = "";
    archTimeout: number = -1;
    archTimeoutDays: number = -1;
    purgeActive: string = "";
    maxRffQueue: number = -1;
    rffMaxArchTimeout: number = -1;
    enableStatecheck: string = "";
    minimum: string = "";

    //Constructor
    constructor(id : string) {
        this.name = id;
    }

    set(field: string, value: string) : void {

        if (field === "interval") {
            this.interval = value;
        }
        if (field === "time") {
            this.time = value;
        }
        else if ((field === "enable")) {
            if (value.indexOf("true") === -1) {
                this.enabled = false;
            }
            else {
                this.enabled = true;
            }
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
                value = value.trim();
                var temp = value.split(" ").map(Number);
                this.basefolders = temp;
            }
            catch (Exception) {
                this.basefolders = [];
            }
            this.basefolderCount = this.basefolders.length;
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

    public SayHello() : void {
        console.log("Hello! I am rule " + this.name);
    }

    public CreateTableRow(): HTMLTableRowElement {
        //Get member variables of this class
        var memVars = Object.getOwnPropertyNames(this);
        console.log(memVars);
        //Create a blank table row
        var row: HTMLTableRowElement = document.createElement('tr');

        //For each variable add a new cell
        for (var propRef in memVars) {
            var property = memVars[+propRef];
            var cell = row.insertCell(+propRef);

            //If value was not set leave blank, temp workaround?
            if (this[property] == -1) {
                cell.innerHTML = "";
            }
            else {
                //Special case to set basefolder array separators
                if (property == "basefolders") {
                    var temp: string[] = this[property];
                    cell.innerHTML = temp.join(", ");
                }
                else
                {
                    cell.innerHTML = this[property];
                }
            }
        }
        return row;
    }
}
