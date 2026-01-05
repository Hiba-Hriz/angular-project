import { Component } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EvtService } from 'src/services/evt.service';
import { MembreService } from 'src/services/membre.service';
import { OutilService } from 'src/services/outil.service';
import { PublicationService } from 'src/services/publication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  Nb_Members: number = 0;
  Nb_Tools: number = 0;
  Nb_Articles: number = 0;
  Nb_Events: number = 0;
  chartData: ChartDataset[] = [
    {
      // ⤵️ Add these
      label: '$ in millions',
      data: [1551, 1688, 1800, 1895, 2124, 2124]
    }
  ];
  chartLabels: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  chartOptions: ChartOptions = {};
  constructor(private Ms: MembreService, private Es: EvtService,
    private os: OutilService, private ps: PublicationService) {
    this.Ms.GetAllMembres().subscribe((res) => {
      this.Nb_Members = res.length
    })
    this.Es.GetAllEvents().subscribe((res) => {
      this.Nb_Events = res.length
    })
    this.os.getAll().subscribe((res) => {
      this.Nb_Tools = res.length
    })
    this.ps.getAll().subscribe((res) => {
      this.Nb_Articles = res.length
    })


  }
}

