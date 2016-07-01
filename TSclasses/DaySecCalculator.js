var DaySecCalculator = (function () {
    function DaySecCalculator() {
        var _this = this;
        this.mainDiv = document.createElement("div");
        this.secDiv = document.createElement("div");
        this.dayDiv = document.createElement("div");
        this.secLabel = document.createElement("label");
        this.dayLabel = document.createElement("label");
        this.secInput = document.createElement("input");
        this.dayInput = document.createElement("input");
        this.mainDiv.appendChild(this.secDiv);
        this.mainDiv.appendChild(this.dayDiv);
        this.secDiv.appendChild(this.secLabel);
        this.secDiv.appendChild(this.secInput);
        this.dayDiv.appendChild(this.dayLabel);
        this.dayDiv.appendChild(this.dayInput);
        this.secLabel.innerHTML = "Seconds:";
        this.dayLabel.innerHTML = "Days:";
        this.secInput.type = "text";
        this.secInput.value = "0";
        this.secInput.id = "txtSeconds";
        this.dayInput.type = "text";
        this.dayInput.value = "0";
        this.dayInput.id = "txtDays";
        this.dayInput.onclick = function () { return _this.dayInput.select(); };
        this.secInput.onclick = function () { return _this.secInput.select(); };
        this.dayInput.onkeyup = function () { return _this.UpdateCalculator(_this.dayInput); };
        this.secInput.onkeyup = function () { return _this.UpdateCalculator(_this.secInput); };
    }
    ;
    DaySecCalculator.prototype.UpdateCalculator = function (input) {
        if (input.id === "txtSeconds") {
            var val = input.value / (24 * 60 * 60);
            this.dayInput.value = val.toFixed(3).toString();
        }
        else if (input.id === "txtDays") {
            var val = input.value * 24 * 60 * 60;
            this.secInput.value = val.toString();
        }
    };
    DaySecCalculator.prototype.Build = function () {
        return this.mainDiv;
    };
    return DaySecCalculator;
}());
