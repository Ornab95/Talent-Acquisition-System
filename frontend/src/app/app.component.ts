import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CacheService } from './services/cache.service';
import { BrowserDetectionService } from './services/browser-detection.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected readonly appTitle = signal('TAS');

  constructor(
    private cacheService: CacheService,
    private browserService: BrowserDetectionService
  ) {}

  ngOnInit() {
    this.browserService.handleChromeSpecificIssues();
    

  }
}
