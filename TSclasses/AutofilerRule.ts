class AutofilerRule {
    id: number = 0;
    name: string = "";
    purgeTimeoutSec: number = -1;
    purgeTimeoutDays: number = -1;
    basefolderCount: number = 0;
    basefolder_ids: number[] = null;
    basefolders: Basefolder [] = [];
    basefolderLocations: string[] = null;
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
            if (this.basefolder_ids == null) {
                try {
                    value = value.trim();
                    let temp = value.split(" ").map(Number);
                    this.basefolder_ids = temp;
                }
                catch (Exception) {
                    this.basefolder_ids = [];
                }
            }
            else {
                return false;
            }
            this.basefolderCount = this.basefolder_ids.length;
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

    public CreateTableRow(): HTMLTableRowElement {
        //Get member variables of this class
        let memVars = Object.getOwnPropertyNames(this);
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
                if (property === "basefolder_ids") {
                    if (this.basefolder_ids !== null) {
                        let temp: string[] = this[property];
                        cell.innerHTML = temp.join(", ");
                    }
                    else {
                        cell.innerHTML = "";
                    }
                }
                else if (property === "basefolders") {
                    for (var ref in this.basefolders) {
                        var bf: Basefolder = this.basefolders[ref];
                        if (bf != null) {
                            cell.innerHTML += bf.name + "<br/>";
                        }
                        else {
                            cell.innerHTML += "";
                        }
                    }
                }
                else if (property === "basefolderLocations") {
                    for (var ref in this.basefolders) {
                        var bf: Basefolder = this.basefolders[ref];
                        if (bf != null) {
                            cell.innerHTML += bf.location + "<br/>";
                        }
                        else {
                            cell.innerHTML += "";
                        }
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



    public ToCsvRow(): string {
        //Get member variables of this class
        let memVars = Object.getOwnPropertyNames(this);

        let rowString = "";

        //For each variable add a new cell
        for (let propRef in memVars) {
            let value = "";

            let property = memVars[+propRef];

            //If value was not set leave blank, temp workaround?
            if (this[property] == -1) {
                value = "";
            }
            else {
                //Special case to set basefolder array separators
                if (property === "basefolder_ids") {
                    if (this.basefolder_ids !== null) {
                        let temp: string[] = this[property];
                        value = temp.join(" ");
                    }
                    else {
                        value = "";
                    }
                }
                else if (property === "basefolders") {
                    for (var ref in this.basefolders) {
                        var bf: Basefolder = this.basefolders[ref];
                        if (bf != null) {
                            value += bf.name + " ";
                        }
                        else {
                            value += "";
                        }
                    }
                }
                else if (property === "basefolderLocations") {
                    value = "";
                    //for (var ref in this.basefolders) {
                    //    var bf: Basefolder = this.basefolders[ref];
                    //    if (bf != null) {
                    //        cell.innerHTML += bf.location + "<br/>";
                    //    }
                    //    else {
                    //        cell.innerHTML += "";
                    //    }
                    //}
                }
                else {
                    value = this[property];
                }
            }
            rowString += value + ",";
        }
        return rowString + "\n";
    }
}
