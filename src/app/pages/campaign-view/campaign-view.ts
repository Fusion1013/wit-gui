import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CampaignApiService, CampaignEntity, TrackApiService } from "../../api";
import { CampaignRow } from "./campaign-row/campaign-row";

@Component({
    selector: 'wit-campaign-view',
    imports: [CommonModule, FormsModule, CampaignRow],
    templateUrl: './campaign-view.html',
    styleUrl: './campaign-view.scss'
})
export class CampaignView implements OnInit {

    tracks: any[] = [];
    campaigns: CampaignEntity[] = [];
    filteredCampaigns: CampaignEntity[] = [];

    searchTerm: string = '';

    introTrackInput: string = '';
    newCampaign: any = {
        name: '',
        introTrackId: ''
    };

    private readonly campaignService = inject(CampaignApiService);
    private readonly trackService = inject(TrackApiService);
    private readonly cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.loadCampaigns();
        this.loadTracks();
    }

    loadCampaigns(): void {
        this.campaignService.getAllCampaigns().subscribe(data => {
            this.campaigns = data;
            this.filteredCampaigns = data.sort((a, b) => {
                const titleA = a.name?.toLowerCase() ?? '';
                const titleB = b.name?.toLowerCase() ?? '';

                return titleA.localeCompare(titleB);
            });
            this.cd.detectChanges();
        });
    }

    private loadTracks(): void {
        this.trackService.getAllTracks().subscribe(data => {
            this.tracks = data;
            this.cd.detectChanges();
        });
    }

    applyFilter() {
        const term = this.searchTerm.toLowerCase();

        this.filteredCampaigns = this.campaigns.filter(campaign => {
            return (
                campaign.name?.toLowerCase().includes(term) ||
                campaign.introTrack?.title?.toLowerCase().includes(term)
                )
        });
    }

    addCampaign() {
        this.newCampaign.introTrackId = this.tracks.find(item => item.title === this.introTrackInput)?.id;

        if (this.newCampaign.introTrackId != null) {
            this.trackService.getTrack(this.newCampaign.introTrackId).subscribe(track => {
                this.createCampaign(track);
            });
        } else {
            this.createCampaign(null);
        }
    }

    private createCampaign(track: any) {
        this.campaignService.createCampaign({
            name: this.newCampaign.name,
            introTrack: track
        }).subscribe(() => {
            this.newCampaign = {
                name: '',
                introTrack: undefined
            };
            this.introTrackInput = '';
            this.loadCampaigns();
        });
    }

}