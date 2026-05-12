import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TrackPropertyTypeEntity } from "../../../api";

@Component({
    selector: 'wit-property-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './property-row.html',
    styleUrl: './property-row.scss'
})
export class PropertyRow {
    
    property = input<TrackPropertyTypeEntity>();

    isEditingProperty: boolean = false;

    preventPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

    saveEdit(event: MouseEvent) {

    }

    cancelEdit(event: MouseEvent) {

    }

    startEdit(event: MouseEvent) {

    }

    deleteProperty(event: MouseEvent) {
        
    }

    get name() {
        return this.property()?.name;
    }

    get description() {
        return this.property()?.description;
    }

    get lowerValueDescription() {
        return this.property()?.lowerValueDescription;
    }

    get upperValueDescription() {
        return this.property()?.upperValueDescription;
    }

}