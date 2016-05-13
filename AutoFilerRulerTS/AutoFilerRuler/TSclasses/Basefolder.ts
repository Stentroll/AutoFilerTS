class Basefolder {
    id: number;
    name: string;
    type_id: number;
    location: string;
    id_string: string;

    Set(field: string, value: string): void {
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
    }
}