class Basefolder {
    id: number = 0;
    name: string = "";
    type_id: number = 0;
    location: string = "";
    id_string: string = "";
    autofilerrules: AutofilerRule[] = [];

    //Constructor
    //constructor(id: number) {
    //    this.id = id;
    //}

    public ToCsvRow(): string {
        var result: string = "";

        result += this.id.toString() + ",";
        result += this.name + ",";
        result += this.type_id + ",";
        result += this.location + ",";
        result += this.id_string + ",";


        for (let afref in this.autofilerrules) {
            let af = this.autofilerrules[afref];
            result += af.name + ",";
        }

        result += "\n";

        return result;
    }
}