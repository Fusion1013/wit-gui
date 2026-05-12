import { Component, ElementRef, HostListener, inject, input, OnInit, output, ViewChild } from "@angular/core";
import { TagApiService, TagEntity } from "../../api";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
    selector: 'wit-tag-multi-select',
    imports: [CommonModule, FormsModule],
    templateUrl: './tag-multi-select.html',
    styleUrl: './tag-multi-select.scss'
})
export class TagMultiSelectComponent implements OnInit {

    @ViewChild('inputElement') inputElement!: ElementRef;

    dropdownStyle: any = {};

    tagService = inject(TagApiService);

    inputTags = input<TagEntity[]>();

    availableTags: TagEntity[] = [];
    selectedTags: TagEntity[] = [];

    selectedTagsChange = output<TagEntity[]>();

    search = '';

    isOpen: boolean = false;

    clear$ = input<Subject<void>>();

    ngOnInit(): void {
        this.loadTags();
        this.clear$()?.subscribe(() => {
            this.selectedTags = [];
        });
        this.selectedTags = this.inputTags()!;
    }

    private loadTags(): void {
        this.tagService.getAllTags().subscribe(data => {
            this.availableTags = data;
        });
    }

    isSelected(tag: TagEntity): boolean {
        return !!this.selectedTags?.some(t => t.id === tag.id);
    }

    toggleTag(tag: TagEntity) {
        if (this.isSelected(tag)) {
            this.selectedTags = this.selectedTags?.filter(t => t.id !== tag.id);
        } else {
            this.selectedTags = [...this.selectedTags, tag];
        }

        this.selectedTagsChange.emit(this.selectedTags);
        this.close();
    }

    removeTag(tag: TagEntity) {
        this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
        this.selectedTagsChange.emit(this.selectedTags);
    }

    open() {
        const rect = this.inputElement.nativeElement.getBoundingClientRect();

        this.dropdownStyle = {
            top: `${rect.bottom}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`
        };

        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    onBlur() {
        setTimeout(() => {
            this.close();
        }, 150);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        if (!(event.target as HTMLElement).closest('.tag-select')) {
            this.close();
        }
    }

    get filteredTags(): TagEntity[] | undefined {
        if (!this.search) return this.availableTags;

        return this.availableTags?.filter(tag =>
            tag.name?.toLowerCase().includes(this.search.toLowerCase())
        );
    }
}