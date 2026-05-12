import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TagApiService, TagEntity } from "../../../api";

@Component({
    selector: 'wit-tag-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './tag-row.html',
    styleUrl: './tag-row.scss'
})
export class TagRow {
    
    tagService = inject(TagApiService);

    tag = input<TagEntity>();
    changeEvent = output<any>();

    editBuffer: any = {};

    isEditingTag: boolean = false;
    editingBuffer: any = {};

    saveEdit(event: MouseEvent) {
        event.stopPropagation();
        if (!this.isEditingTag) return;
        this.updateTag(this.id);
    }

    private updateTag(id: any) {
        this.tagService.updateTag(id, this.editBuffer).subscribe(() => {
            this.cancelEdit(undefined);
            this.changeEvent.emit(this.tag);
        });
    }

    cancelEdit(event: MouseEvent | undefined) {
        if (event) event.stopPropagation();
        this.isEditingTag = false;
        this.editBuffer = {};
    }

    startEdit(event: MouseEvent) {
        event.stopPropagation();
        this.isEditingTag = true;

        this.editBuffer = {
            ...this.tag()
        };
    }

    deleteTag(event: MouseEvent) {
        event.stopPropagation();
        this.tagService.deleteTag(this.id).subscribe(() => {
            this.changeEvent.emit(this.tag);
        })
    }

    get id(): any {
        return this.tag()?.id;
    }

}