import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TrackPropertyApiService, TrackPropertyTypeEntity } from "../../api";
import { PropertyRow } from "./property-row/property-row";

@Component({
    selector: 'wit-property-view',
    imports: [CommonModule, FormsModule, PropertyRow],
    templateUrl: './property-view.html',
    styleUrl: './property-view.scss'
})
export class PropertyView implements OnInit {
    
    properties: TrackPropertyTypeEntity[] = [];
    filteredProperties: TrackPropertyTypeEntity[] = [];

    searchTerm: string = "";

    newProperty: any = {
        name: '',
        description: '',
        lowerValueDescription: '',
        upperValueDescription: ''
    };

    private readonly propertyService = inject(TrackPropertyApiService);
    private readonly cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.loadProperties();
    }

    loadProperties(): void {
        this.propertyService.getAllPropertyTypes().subscribe(data => {
            this.properties = data;
            this.filteredProperties = data.sort((a, b) => {
                const titleA = a.name?.toLowerCase() ?? '';
                const titleB = b.name?.toLowerCase() ?? '';

                return titleA.localeCompare(titleB);
            });
            this.cd.detectChanges();
        })
    }

    applyFilter() {
        const term = this.searchTerm.toLowerCase();

        this.filteredProperties = this.properties.filter(property => {
            return (
                property.name?.toLowerCase().includes(term)
            );
        });
    }

    addProperty() {
        this.propertyService.createTrackPropertyType(this.newProperty).subscribe(() => {
            this.newProperty = {
                name: '',
                description: '',
                lowerValueDescription: '',
                upperValueDescription: ''
            };

            this.loadProperties();
        })
    }

}