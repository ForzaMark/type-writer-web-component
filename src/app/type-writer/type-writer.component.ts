import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';

type Quote = { author: string; content: string };

@Component({
  selector: 'app-type-writer',
  templateUrl: './type-writer.component.html',
  styleUrls: ['./type-writer.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TypeWriterComponent implements AfterViewInit{

  @ViewChild('output', { static: false }) outputSelector: ElementRef;

  speedForward = 100;
  speedWait = 1000;
  speedBetweenLines = 1000;
  speedBackspace = 25;

  private viewInit$: Subject<void> = new Subject<void>();
  private viewInit = false;

  private _quotes: Quote[];

  @Input() set quotes(params: any) {
    const data = JSON.parse(params);
    if (this.viewInit) {
      this.typeWriter(data);
    }
    this.viewInit$.subscribe(
      () => {
        this.typeWriter(data);
      }
    )
  }

  get quotes() {
    return this._quotes;
  }

  private recursionIndex = 0;
  private quoteElementIndex = 0;
  private isBackspacing = false;
  private writesAuthorInformation = false;
  private notYetStartedToWriteAuthor = true;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.viewInit$.next();
    this.viewInit = true;
  }

  typeWriter(quotes: { author: string; content: string }[]) {
    const outputHtmlElement = this.outputSelector.nativeElement;
    const currentQuote = quotes[this.quoteElementIndex];
    const quoteContentElement = outputHtmlElement.children[0];
    const quoteAuthorElement = outputHtmlElement.children[1];

    const currentQuoteFullLength =
      currentQuote.content.length + currentQuote.author.length;

    if (!this.isBackspacing) {
      if (this.recursionIndex < currentQuoteFullLength) {
        if (currentQuote.content.length === this.recursionIndex) {
          this.switchFromContentToAuthorMode(
            quoteContentElement,
            quoteAuthorElement,
            quotes
          );
        } else {
          this.writeContentOrAuthor(
            quoteContentElement,
            currentQuote,
            quoteAuthorElement,
            quotes
          );
        }
      } else if (this.recursionIndex === currentQuoteFullLength) {
        this.switchToBackspacingMode(quotes);
      }
    } else {
      if (
        quoteContentElement.innerText.length > 0 ||
        quoteAuthorElement.innerText.length > 0
      ) {
        this.backspaceContentOrAuthor(
          quoteContentElement,
          quoteAuthorElement,
          quotes
        );
      } else {
        this.restartWithNewQuote(quotes);
      }
    }
  }

  private switchFromContentToAuthorMode(
    quoteContentElement: any,
    quoteAuthorElement: any,
    quotes: Quote[]
  ): void {
    this.writesAuthorInformation = true;
    this.renderer.removeClass(quoteContentElement, 'cursor');
    this.renderer.addClass(quoteAuthorElement, 'cursor');
    this.recursionIndex++;
    setTimeout(() => {
      this.typeWriter(quotes);
    }, this.speedBetweenLines);
  }

  private writeContentOrAuthor(
    quoteContentElement: any,
    currentQuote: Quote,
    quoteAuthorElement: any,
    quotes: Quote[]
  ): void {
    if (!this.writesAuthorInformation) {
      quoteContentElement.innerText =
        quoteContentElement.innerText +
        currentQuote.content.charAt(this.recursionIndex);
    } else {
      if (this.notYetStartedToWriteAuthor) {
        this.recursionIndex--;
        this.notYetStartedToWriteAuthor = false;
      }
      const authorIndex = (this.recursionIndex - currentQuote.content.length)
      quoteAuthorElement.innerText =
        quoteAuthorElement.innerText +
        currentQuote.author.charAt(authorIndex);
    }
    this.recursionIndex++;
    setTimeout(() => {
      this.typeWriter(quotes);
    }, this.speedForward);
  }

  private switchToBackspacingMode(quotes: Quote[]): void {
    this.isBackspacing = true;
    setTimeout(() => {
      this.typeWriter(quotes);
    }, this.speedWait);
  }

  private backspaceContentOrAuthor(
    quoteContentElement: any,
    quoteAuthorElement: any,
    quotes: Quote[]
  ): void {
    if (quoteAuthorElement.innerText.length > 0) {
      quoteAuthorElement.innerText = quoteAuthorElement.innerText.substring(
        0,
        quoteAuthorElement.innerText.length - 1
      );
    } else if (quoteContentElement.innerText.length > 0) {
      this.renderer.removeClass(quoteAuthorElement, 'cursor');
      this.renderer.addClass(quoteContentElement, 'cursor');
      quoteContentElement.innerText = quoteContentElement.innerText.substring(
        0,
        quoteContentElement.innerText.length - 1
      );
    }
    setTimeout(() => {
      this.typeWriter(quotes);
    }, this.speedBackspace);
  }

  private restartWithNewQuote(quotes: Quote[]): void {
    this.isBackspacing = false;
    this.recursionIndex = 0;
    this.writesAuthorInformation = false;
    this.notYetStartedToWriteAuthor = true;
    this.quoteElementIndex = (this.quoteElementIndex + 1) % quotes.length;
    setTimeout(() => {
      this.typeWriter(quotes);
    }, 50);
  }

}
