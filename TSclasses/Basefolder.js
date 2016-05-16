var Basefolder = (function () {
    function Basefolder() {
    }
    Basefolder.prototype.Set = function (field, value) {
        //console.log("Setting: " + field + " - " + value);
        if ((field === "id")) {
            this.id = Number(value);
        }
        else if ((field === "name")) {
            this.name = value;
        }
        else if ((field === "type_id")) {
            this.type_id = Number(value);
        }
        else if ((field === "location")) {
            this.location = value;
        }
        else if ((field === "id_string")) {
            this.id_string = value;
        }
    };
    return Basefolder;
}());
//# sourceMappingURL=basefolder.js.map