var FilterHelper = (function () {
    function FilterHelper() {
    }
    return FilterHelper;
}());
function FilterAFonBfId(rule) {
    var tmp = rule.basefolders;
    if (tmp.indexOf(this.valueOf()) === -1) {
        return false;
    }
    else {
        return true;
    }
}
function FilterBFonBFId(bf) {
    var tmp = bf.id;
    if (tmp != this.valueOf()) {
        return false;
    }
    else {
        return true;
    }
}
function FilterAFonRuleName(rule) {
    var tmp = rule.name;
    tmp = tmp.toLowerCase();
    if (tmp.indexOf(this.toLowerCase()) === -1) {
        return false;
    }
    else {
        return true;
    }
}
function FilterRuleEnabled(rule) {
    return rule.enabled;
}
