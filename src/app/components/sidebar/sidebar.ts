import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DiscordInfoApiService, DiscordStatusDTO, DiscordVoiceChannelDto } from "../../api";
import { interval, switchMap } from "rxjs";
import { ProgressBar } from "../progress-bar/progress-bar";

type GuildGroup = {
    guildId: string;
    guildName: string | undefined;
    channels: DiscordVoiceChannelDto[];
}

@Component({
    selector: 'wit-sidebar',
    imports: [CommonModule, FormsModule, ProgressBar],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {

    private readonly discordService = inject(DiscordInfoApiService);
    private cd = inject(ChangeDetectorRef);

    discordInfo: DiscordStatusDTO = {};
    groupedChannels: GuildGroup[] = [];

    ngOnInit(): void {
        this.update();
    }
    
    private update() {
        interval(3000)
            .pipe(
                switchMap(() => this.discordService.getInfo())
            )
            .subscribe(data => {
                this.discordInfo = data;
                this.groupChannels();
                this.cd.detectChanges();
            });
    }

    private groupChannels(): void {
        const map = new Map<string, GuildGroup>();

        this.discordInfo.voiceChannels?.forEach(channel => {
            if (channel.guildId == null) return;
            if (!map.has(channel.guildId)) {
                map.set(channel.guildId, {
                    guildId: channel.guildId,
                    guildName: channel.guildName,
                    channels: []
                });
            }

            map.get(channel.guildId)!.channels.push(channel);
        });
        this.groupedChannels = Array.from(map.values());
    }

    joinVoiceChannel(voiceChannel: any) {
        this.discordService.joinChannel(voiceChannel.guildId, voiceChannel.channelId).subscribe();
    }

}