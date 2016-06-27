class AutofilerRule {
    id: number = 0;
    name: string = "";
    purgeTimeoutSec: number = -1;
    purgeTimeoutDays: number = -1;
    basefolderCount: number = 0;
    basefolders: number[] = null;
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
    constructor(id : number) {
        this.id = id;
    }

    Set(field: string, value: string) : boolean {

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
            if (this.basefolders === null) {
                try {
                    value = value.trim();
                    let temp = value.split(" ").map(Number);
                    this.basefolders = temp;
                }
                catch (Exception) {
                    this.basefolders = [];
                }
            }
            else {
                return false;
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
        return true;
    }

    public SayHello() : void {
        console.log("Hello! I am rule " + this.name);
    }

    public CreateTableRow(): HTMLTableRowElement {
        //Get member variables of this class
        let memVars = Object.getOwnPropertyNames(this);
        //console.log(memVars);
        //Create a blank table row
        let row: HTMLTableRowElement = document.createElement('tr');

        //For each variable add a new cell
        for (let propRef in memVars) {
            let property = memVars[+propRef];
            let cell = row.insertCell(+propRef);

            //If value was not set leave blank, temp workaround?
            if (this[property] == -1) {
                cell.innerHTML = "";
            }
            else {
                //Special case to set basefolder array separators
                if (property == "basefolders") {
                    if (this.basefolders !== null) {
                        let temp: string[] = this[property];
                        cell.innerHTML = temp.join(", ");
                    }
                    else {
                        cell.innerHTML = "";
                    }
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
