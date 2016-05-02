var AutofilerRule = (function () {
    //Constructor
    function AutofilerRule(id) {
        this.name = "";
        this.purgeTimeoutSec = 0;
        this.purgeTimeoutDays = 0;
        this.basefolders = [];
        this.archival = "";
        this.upperLimit = 0;
        this.lowerLimit = 0;
        this.time = "";
        this.enabled = true;
        this.interval = "";
        this.archTimeout = 0;
        this.archTimeoutDays = 0;
        this.purgeActive = "";
        this.maxRffQueue = 0;
        this.rffMaxArchTimeout = 0;
        this.enableStatecheck = "";
        this.minimum = "";
        this.name = id;
    }
    AutofilerRule.prototype.set = function (field, value) {
        //console.log("Setting field: " + field + " to: " + value);
        if (field === "interval") {
            this.interval = value;
        }
        if (field === "time") {
            this.time = value;
        } else if ((field === "enable")) {
            this.enabled = !!value;
        } else if ((field === "purge_timeout")) {
            this.purgeTimeoutSec = Number(value);
            this.purgeTimeoutDays = Math.round(Number(value) / (24.0 * 60.0 * 60.0) * 10) / 10;
        } else if ((field === "archival")) {
            this.archival = value;
        } else if ((field === "lower_limit")) {
            this.lowerLimit = Number(value);
        } else if ((field === "upper_limit")) {
            this.upperLimit = Number(value);
        } else if ((field === "base_folder_ids")) {
            try  {
                value = value.replace(",", " ");
                var temp = value.split(" ");
                this.basefolders = temp;
            } catch (Exception) {
                this.basefolders = [];
            }
        } else if ((field === "arch_timeout")) {
            this.archTimeout = Number(value);
            this.archTimeoutDays = Math.round(Number(value) / (24.0 * 60.0 * 60.0) * 10) / 10;
        } else if ((field === "purge")) {
            this.purgeActive = value;
        } else if ((field === "max_rff_queue")) {
            this.maxRffQueue = Number(value);
        } else if ((field === "rff_max_arch_timeout")) {
            this.rffMaxArchTimeout = Number(value);
        } else if ((field === "enableStatecheck")) {
            this.enableStatecheck = value;
        } else if ((field === "minimum")) {
            this.minimum = value;
        }
    };

    AutofilerRule.prototype.SayHello = function () {
        console.log("Hello! I am rule " + this.name);
    };

    AutofilerRule.prototype.CreateTableRow = function () {
        var properties = Object.getOwnPropertyNames(this);

        var row = document.createElement('tr');

        for (var propRef in properties) {
            var property = properties[propRef];
            var cell = row.insertCell(propRef);

            if (this[property] == 0) {
                cell.innerHTML = "";
            } else {
                cell.innerHTML = this[property];
            }
        }
        return row;
    };
    return AutofilerRule;
})();
//# sourceMappingURL=AutofilerRule.js.map
