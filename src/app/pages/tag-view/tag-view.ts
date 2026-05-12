import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TagApiService, TagEntity } from "../../api";
import { TagRow } from "./tag-row/tag-row";

@Component({
    selector: 'wit-tag-view',
    imports: [CommonModule, FormsModule, TagRow],
    templateUrl: './tag-view.html',
    styleUrl: './tag-view.scss'
})
export class TagView implements OnInit {

    private readonly tagService = inject(TagApiService);
    private readonly cd = inject(ChangeDetectorRef);

    tags: TagEntity[] = [];
    filteredTags: TagEntity[] = [];

    searchTerm: string = '';

    newTag: any = {
        name: '',
        selectionMethod: undefined
    };

    ngOnInit(): void {
        this.loadTags();
    }

    loadTags(): void {
        this.tagService.getAllTags().subscribe(data => {
            this.tags = data;
            this.filteredTags = data.sort((a, b) => {
                const titleA = a.name?.toLowerCase() ?? '';
                const titleB = b.name?.toLowerCase() ?? '';

                return titleA.localeCompare(titleB);
            });
            this.cd.detectChanges();
        })
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();

        this.filteredTags = this.tags.filter(tag => {
            return (
                tag.name?.toLowerCase().includes(term) ||
                tag.selectionMethod?.toLowerCase().includes(term)
                )
        });
    }

    addTag(): void {
        this.tagService.createTag(this.newTag).subscribe(data => {
            this.newTag = {};
        });
        this.loadTags();
    }

}