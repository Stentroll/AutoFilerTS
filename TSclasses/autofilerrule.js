var AutofilerRule = (function () {
    function AutofilerRule(id) {
        this.id = 0;
        this.name = "";
        this.purgeTimeoutSec = -1;
        this.purgeTimeoutDays = -1;
        this.basefolderCount = 0;
        this.basefolders = null;
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
        this.id = id;
    }
    AutofilerRule.prototype.Set = function (field, value) {
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
                    var temp = value.split(" ").map(Number);
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
    };
    AutofilerRule.prototype.SayHello = function () {
        console.log("Hello! I am rule " + this.name);
    };
    AutofilerRule.prototype.CreateTableRow = function () {
        var memVars = Object.getOwnPropertyNames(this);
        var row = document.createElement('tr');
        for (var propRef in memVars) {
            var property = memVars[+propRef];
            var cell = row.insertCell(+propRef);
            if (this[property] == -1) {
                cell.innerHTML = "";
            }
            else {
                if (property == "basefolders") {
                    if (this.basefolders !== null) {
                        var temp = this[property];
                        cell.innerHTML = temp.join(", ");
                    }
                    else {
                        cell.innerHTML = "";
                    }
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
