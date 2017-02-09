var Basefolder = (function () {
    function Basefolder() {
        this.id = 0;
        this.name = "";
        this.type_id = 0;
        this.location = "";
        this.id_string = "";
        this.autofilerrules = [];
    }
    Basefolder.prototype.ToCsvRow = function () {
        var result = "";
        result += this.id.toString() + ",";
        result += this.name + ",";
        result += this.type_id + ",";
        result += this.location + ",";
        result += this.id_string + ",";
        for (var afref in this.autofilerrules) {
            var af = this.autofilerrules[afref];
            result += af.name + ",";
        }
        result += "\n";
        return result;
    };
    return Basefolder;
}());
