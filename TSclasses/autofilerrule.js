var AutofilerRule = (function () {
    function AutofilerRule(id) {
        this.id = 0;
        this.name = "";
        this.purgeTimeoutSec = -1;
        this.purgeTimeoutDays = -1;
        this.basefolderCount = 0;
        this.basefolder_ids = null;
        this.basefolders = [];
        this.basefolderLocations = null;
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
            if (this.basefolder_ids == null) {
                try {
                    value = value.trim();
                    var temp = value.split(" ").map(Number);
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
                if (property === "basefolder_ids") {
                    if (this.basefolder_ids !== null) {
                        var temp = this[property];
                        cell.innerHTML = temp.join(", ");
                    }
                    else {
                        cell.innerHTML = "";
                    }
                }
                else if (property === "basefolders") {
                    for (var ref in this.basefolders) {
                        var bf = this.basefolders[ref];
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
                        var bf = this.basefolders[ref];
                        if (bf != null) {
                            cell.innerHTML += bf.location + "<br/>";
                        }
                        else {
                            cell.innerHTML += "";
                        }
                    }
                }
                else {
                    cell.innerHTML = this[property];
                }
            }
        }
        return row;
    };
    AutofilerRule.prototype.ToCsvRow = function () {
        var memVars = Object.getOwnPropertyNames(this);
        var rowString = "";
        for (var propRef in memVars) {
            var value = "";
            var property = memVars[+propRef];
            if (this[property] == -1) {
                value = "";
            }
            else {
                if (property === "basefolder_ids") {
                    if (this.basefolder_ids !== null) {
                        var temp = this[property];
                        value = temp.join(" ");
                    }
                    else {
                        value = "";
                    }
                }
                else if (property === "basefolders") {
                    for (var ref in this.basefolders) {
                        var bf = this.basefolders[ref];
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
                }
                else {
                    value = this[property];
                }
            }
            rowString += value + ",";
        }
        return rowString + "\n";
    };
    return AutofilerRule;
}());
