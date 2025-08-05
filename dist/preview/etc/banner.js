(function(){"use strict";class p{constructor(e){this._baseUrl=e}async getAdCardContent(e,t,s){const n=new URL("/api/adcard",this._baseUrl);t&&n.searchParams.set("clientid",t),e&&n.searchParams.set("targetAreaId",e),s&&n.searchParams.set("vins",s);const i=await fetch(n,{method:"GET"});return i.ok?{hasContent:i.status!==204,html:await i.text()}:(console.error(`Failed to get Ad Card for Client ID ${t} and Target Area ${e} with status ${i.status}`),{hasContent:!1,html:""})}async getAdCardContentById(e,t){const s=new URL("/api/adcard/v2",this._baseUrl);e&&s.searchParams.set("targetAreaId",e),t&&s.searchParams.set("bannerId",t);const n=await fetch(s,{method:"GET"});return n.ok?{hasContent:n.status!==204,html:await n.text()}:(console.error(`Failed to get Ad Card for Target Area ${e} with status ${n.status}`),{hasContent:!1,html:""})}async getCarouselContentById(e,t,s){const n=new URL("/api/conditionalblock",this._baseUrl);e&&n.searchParams.set("targetAreaId",e),t&&n.searchParams.set("carouselId",t),s&&n.searchParams.set("bannerIds",s);const i=await fetch(n,{method:"GET"});return i.ok?{hasContent:i.status!==204,html:await i.text()}:(console.error(`Failed to get Carousel for Target Area ${e} with status ${i.status}`),{hasContent:!1,html:""})}static getBaseUrlFromScript(){const e=document.currentScript;if(e&&"src"in e){const t=e.src;return new URL(t).origin}return location.origin}}const u=new CSSStyleSheet;u.insertRule(":host { display: block; position: relative; margin: 0; padding: 0; }"),u.insertRule(":host(:not([carousel-id])) { grid-area: head / head / compare / compare; height: 100%; }"),u.insertRule(":host([carousel-id]) { min-height: 240px; }");function g(r){return class extends HTMLElement{constructor(){super(),this.isInitialized=!1,this._shadowRoot=this.attachShadow({mode:"open"}),this._shadowRoot.adoptedStyleSheets=[u],this.isInitialized=!1}static get observedAttributes(){return["target-area","vins","banner-id","carousel-id"]}get clientId(){return window.DlronGlobal_DealerId.toString()}get targetArea(){return this.getAttribute("target-area")??""}set targetArea(t){this.setAttribute("target-area",t)}get vins(){return this.getAttribute("vins")??""}set vins(t){this.setAttribute("vins",t)}get bannerId(){return this.getAttribute("banner-id")??""}set bannerId(t){this.setAttribute("banner-id",t)}get carouselId(){return this.getAttribute("carousel-id")??""}set carouselId(t){this.setAttribute("carousel-id",t)}get contentStatus(){return this.getAttribute("content")}set contentStatus(t){this.setAttribute("content",t)}async connectedCallback(){this.isInitialized||(await this.lazyLoadContent(),this.isInitialized=!0)}async attributeChangedCallback(t,s,n){t==="target-area"&&s&&s!==n&&await this.lazyLoadContent(),t==="vins"&&s&&s!==n&&await this.lazyLoadContent(),t==="banner-id"&&s&&s!==n&&await this.lazyLoadContent(),t==="carousel-id"&&s&&s!==n&&await this.lazyLoadContent()}async lazyLoadContent(){const t=new IntersectionObserver(async s=>{s[0].isIntersecting&&this.targetArea&&(this.carouselId?await this.fetchCarouselContentById():(this.bannerId?await this.fetchAdCardContentById():await this.fetchAdCardContent(),await this.addDisclaimerClickHandler()),t.unobserve(this))});t.observe(this)}async fetchAdCardContent(){const t=await r.getAdCardContent(this.targetArea,this.clientId,this.vins),s=t.hasContent?t:{hasContent:!0,html:`<p>I'm the banner for ${this.targetArea} with these vins: ${this.getAttribute("vins")}</p>`};s.hasContent?(this._shadowRoot.innerHTML=s.html,this.contentStatus="loaded"):this.contentStatus="none"}async fetchAdCardContentById(){const t=await r.getAdCardContentById(this.targetArea,this.bannerId),s=t.hasContent?t:{hasContent:!0,html:`<p>I'm the banner for banner id ${this.bannerId} in Target Area for ${this.targetArea}</p>`};s.hasContent?(this._shadowRoot.innerHTML=s.html,this.contentStatus="loaded"):this.contentStatus="none"}async fetchCarouselContentById(){var n,i;const t=await r.getCarouselContentById(this.targetArea,this.carouselId,this.bannerId),s=t.hasContent?t:{hasContent:!0,html:`<p>I'm the Carousel for carousel id ${this.carouselId} in Target Area ${this.targetArea} and contain the following Banners ${this.bannerId}</p>`};if(s.hasContent){this._shadowRoot.innerHTML="";const a=document.createElement("slot"),d=s.html.split("item").length>1,h=document.createElement("do-banner-carousel");if(d)a.innerHTML=s.html;else{const y=document.createElement("div");y.innerHTML=s.html,a.innerHTML=y.outerHTML}const c=document.createElement("style"),m=a.querySelector("style");m&&(c.innerHTML=m.innerHTML,(n=h.shadowRoot)==null||n.appendChild(c),a.removeChild(m)),(i=h.shadowRoot)==null||i.appendChild(a);const b=this._shadowRoot.querySelector("do-banner-carousel");b?b.replaceWith(h):this._shadowRoot.appendChild(h),this.contentStatus="loaded"}else this.contentStatus="none"}async addDisclaimerClickHandler(){const t=this._shadowRoot.querySelector(".adcard-disclaimer"),s=document.querySelector("do-banner-modal");t&&(s||document.body.appendChild(document.createElement("do-banner-modal")),t.addEventListener("click",()=>{const n=document.querySelector("do-banner-modal"),i=t.getAttribute("data-modal-text");if(i){const a=document.createElement("span");a.setAttribute("slot","body"),a.textContent=i,n==null||n.replaceChildren(a),n==null||n.showModal()}}))}}}const l=new CSSStyleSheet;l.insertRule(`
  @media (min-width: 768px) {
    .banr-modal {
      width: 600px;
    }
  }
  `),l.insertRule(`
  .banr-modal {
    border: 1px solid rgba(0, 0, 0, .2);
    border-radius: 6px;
    box-shadow: 0 5px 15px rgba(0,0,0,.5);
    padding: 5px;
    width: auto;
  }`),l.insertRule(`
  .banr-modal-header {
    padding: 5px;
    display: flex;
    justify-content: flex-end;
  }`),l.insertRule(`
  .banr-modal-close {
    -webkit-appearance: none;
    padding: 0;
    cursor: pointer;
    background: transparent;
    border: 0;
    font-size: 2.1em;
    font-weight: 700;
    line-height: 0;
    color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.5em;
    height: 1.5em;
    transition: color 0.3s;
  }`),l.insertRule(`
  .banr-modal-close:hover {
    color: #7f7f7f;
  }`),l.insertRule(`
  .banr-modal-body {
    padding: 15px;
  }`);class f extends HTMLElement{constructor(){super(),this._shadowRoot=this.attachShadow({mode:"open"}),this._shadowRoot.adoptedStyleSheets=[l]}get dialog(){return this._shadowRoot.querySelector("dialog")}showModal(){var e;(e=this.dialog)==null||e.showModal()}hideModal(){var e;(e=this.dialog)==null||e.close()}connectedCallback(){var e;this.setHtml(),(e=this._shadowRoot.querySelector(".banr-modal-close"))==null||e.addEventListener("click",()=>{this.hideModal()})}setHtml(){this._shadowRoot.innerHTML=`
        <dialog class="banr-modal">
          <div class="banr-modal-header">
          <button class="banr-modal-close" aria-label="Close">×</button>
          </div>
          <div class="banr-modal-body">
            <slot name="body"></slot>
          </div>
        </dialog>
      `}}const o=new CSSStyleSheet;o.insertRule(`
  :host {
    display: flex;
    position: relative;
    height: inherit;
    overflow: hidden;
    min-height: 240px;
  }
`),o.insertRule(`
  .item {
    flex: 1;
  }
`),o.insertRule(`
  .item.video {
    aspect-ratio: 16 / 9;
    max-width: 427px;
    margin: 0 auto;
  }
`),o.insertRule(`
  .item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`),o.insertRule(`
  .prev,
  .next {
    cursor: pointer;
    position: absolute;
    top: 50%;
    width: auto;
    margin-top: -22px;
    padding: 16px;
    color: white;
    font-weight: bold;
    font-size: 18px;
    transition: 0.6s ease;
    user-select: none;
    background-color: rgba(0, 0, 0, 0.25);
  }
`),o.insertRule(`
  .prev {
    left: 0;
    border-radius: 0 6px 6px 0;
  }
`),o.insertRule(`
  .next {
    right: 0;
    border-radius: 6px 0 0 6px;
  }
`),o.insertRule(`
  .prev:hover,
  .next:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`),o.insertRule(`
  .dot-container {
    position: absolute;
    bottom: 12px;
    text-align: center;
  }
`),o.insertRule(`
  .dot {
    cursor: pointer;
    height: 14px;
    width: 14px;
    margin: 0 4px;
    border: 1px solid #f6f6f6;
    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.6s ease;
  }
`),o.insertRule(`
  .dot.active {
    background-color: #f6f6f6;
  }
`),o.insertRule(`
  .fade {
    animation-name: fade;
    animation-duration: 1s;
  }
`),o.insertRule(`
  @keyframes fade {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
`);class w extends HTMLElement{constructor(){super(),this.slideIndex=0,this.timeout=setTimeout(()=>"",1e3),this._shadowRoot=this.attachShadow({mode:"open"}),this._shadowRoot.adoptedStyleSheets=[o];const e=document.createElement("script");e.src="https://www.youtube.com/iframe_api",this._shadowRoot.appendChild(e)}get intervalTime(){return this.getAttribute("interval-time")??"6000"}async connectedCallback(){var e,t,s,n;window.YT?this.loadPlayers():window.onYouTubeIframeAPIReady=()=>{this.loadPlayers()},(e=this._shadowRoot.querySelectorAll(".item"))==null||e.forEach(i=>{i.addEventListener("mouseenter",()=>{clearTimeout(this.timeout)}),i.addEventListener("mouseleave",()=>{this.timeout=setTimeout(()=>{this.plusSlides(1)},+this.intervalTime)})}),(t=this._shadowRoot.querySelector(".prev"))==null||t.addEventListener("click",()=>{this.plusSlides(-1)}),(s=this._shadowRoot.querySelector(".next"))==null||s.addEventListener("click",()=>{this.plusSlides(1)}),(n=this._shadowRoot.querySelectorAll(".dot"))==null||n.forEach(i=>{i.addEventListener("click",()=>{this.currentSlide(parseInt(i.id.split("-")[1]))})}),await this.addDisclaimerClickHandler(),this.showSlides(this.slideIndex)}loadPlayers(){this._shadowRoot.querySelectorAll(".video").forEach((t,s)=>{const n=document.createElement("div");n.id=`player-${s+1}`,t.appendChild(n);const i={height:"100%",width:"100%",videoId:t.id,playerVars:{fs:0},events:{onStateChange:this.onPlayerStateChange.bind(this)}};new YT.Player(n,i)})}onPlayerStateChange(e){this.player=e.target,e.data==YT.PlayerState.ENDED||e.data==YT.PlayerState.PAUSED?this.timeout=setTimeout(()=>{this.plusSlides(1)},+this.intervalTime):clearTimeout(this.timeout)}plusSlides(e){this.slideIndex=this.slideIndex+e,this.showSlides(this.slideIndex)}currentSlide(e){this.slideIndex=e,this.showSlides(this.slideIndex)}showSlides(e){this.player&&this.player.getPlayerState()!==YT.PlayerState.ENDED&&this.player.getPlayerState()!==YT.PlayerState.PAUSED&&this.player.pauseVideo(),clearTimeout(this.timeout);let t;const s=this._shadowRoot.querySelectorAll(".item"),n=this._shadowRoot.querySelectorAll(".dot");for(e>s.length-1&&(this.slideIndex=0),e<0&&(this.slideIndex=s.length-1),t=0;t<s.length;t++)t!==this.slideIndex?s[t].style.display="none":s[t].style.display="block";for(t=0;t<n.length;t++)t!==this.slideIndex?n[t].className=n[t].className.replace(" active",""):n[t].className+=" active";this.timeout=setTimeout(()=>{this.plusSlides(1)},+this.intervalTime)}async addDisclaimerClickHandler(){var s,n,i;const e=this._shadowRoot.querySelectorAll(".adcard-disclaimer");document.querySelector("do-banner-modal")||document.body.appendChild(document.createElement("do-banner-modal")),e.length>0&&e.forEach(a=>{a.addEventListener("click",()=>{clearTimeout(this.timeout);const d=document.querySelector("do-banner-modal"),h=a.getAttribute("data-modal-text");if(h){const c=document.createElement("span");c.setAttribute("slot","body"),c.textContent=h,d==null||d.replaceChildren(c),d==null||d.showModal()}})}),(i=(n=(s=document.querySelector("do-banner-modal"))==null?void 0:s.shadowRoot)==null?void 0:n.querySelector(".banr-modal-close"))==null||i.addEventListener("click",()=>{this.timeout=setTimeout(()=>{this.plusSlides(1)},+this.intervalTime)})}}const C=p.getBaseUrlFromScript(),S=new p(C);(async()=>{const r=g(S);customElements.define("do-banner",r),customElements.define("do-banner-modal",f),customElements.define("do-banner-carousel",w)})()})();
