var AutofilerRule = (function () {
    //Constructor
    function AutofilerRule(id) {
        this.name = "";
        this.purgeTimeoutSec = -1;
        this.purgeTimeoutDays = -1;
        this.basefolders = [];
        this.archival = "";
        this.upperLimit = -1;
        this.lowerLimit = -1;
        this.time = "";
        this.enabled = true;
        this.interval = "";
        this.archTimeout = -1;
        this.archTimeoutDays = -1;
        this.purgeActive = "";
        this.maxRffQueue = -1;
        this.rffMaxArchTimeout = -1;
        this.enableStatecheck = "";
        this.minimum = "";
        this.name = id;
    }
    AutofilerRule.prototype.set = function (field, value) {
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
        }
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
    };
    AutofilerRule.prototype.SayHello = function () {
        console.log("Hello! I am rule " + this.name);
    };
    AutofilerRule.prototype.CreateTableRow = function () {
        //Get member variables of this class
        var memVars = Object.getOwnPropertyNames(this);
        //Create a blank table row
        var row = document.createElement('tr');
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
                    var temp = this[property];
                    cell.innerHTML = temp.join(", ");
                }
                else {
                    cell.innerHTML = this[property];
                }
            }
        }
        return row;
    };
    return AutofilerRule;
}());
//# sourceMappingURL=AutofilerRule.js.map