import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {DkgService} from "../../services/dkg.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, Subscription} from "rxjs";

@Component({
  selector: '',
  templateUrl: './context.component.html'
})
export class ContextComponent implements OnInit, OnDestroy, AfterViewInit{
  public contexts: string[];
  public types: string[];
  public useType: boolean = false;
  public contextClaimTopics: boolean = false;
  private routerSubscription: Subscription;

  constructor(private dkgService: DkgService, private router: Router) { };

  ngOnInit() {
    this.checkRoute();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
      this.refreshTypesList();
    });

  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkRoute() {
    const urlSegments = this.router.url.split('/');
    const lastSegment = urlSegments[urlSegments.length - 1];
    if (['topicsRegistry', 'identityRegistry'].includes(lastSegment)) {
      this.contextClaimTopics = true;
    } else {
      this.contextClaimTopics = false;
    }
  }

  get selectedContext() {
    return this.dkgService.selectedContext;
  }

  set selectedContext(val) {
    this.dkgService.selectedContext = val;
    this.refreshTypesList();
  }

  get selectedType() {
    return this.dkgService.selectedType;
  }

  set selectedType(val) {
    this.dkgService.selectedType = val;
  }

  async ngAfterViewInit() {
    this.refreshContextList();
  }

  async refreshContextList() {
    this.contexts = await this.dkgService.getContexts();
  }

  async refreshTypesList() {
    this.types = await this.dkgService.getTypes(this.selectedContext);
  }

}
