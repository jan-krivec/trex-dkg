import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../services/dkg.service";

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html'
})
export class AgentComponent implements OnInit{
  agents: string[];

  constructor(private dkgService: DkgService) { };

  ngOnInit() {
    this.getAgents();
  }

  editAgentForm= new FormGroup({
    agentAddress: new FormControl('', [Validators.required])
  });

  async getAgents() {

    const agents = await this.dkgService.getAgents();

    this.agents = agents;
  }

  async addAgent() {
    await this.dkgService.addAgent(this.editAgentForm.get('agentAddress').value).then(() => {
      this.editAgentForm.reset();
      this.getAgents();
    });

  }

  async removeAgent() {
    await this.dkgService.removeAgent(this.editAgentForm.get('agentAddress').value).then(() => {
      this.editAgentForm.reset();
      this.getAgents();
    });
  }

}
