function msfApp() {
    return {
        tab: 'utm',
        toggleTheme() { document.body.classList.toggle('dark-theme'); },
        copy(t) { navigator.clipboard.writeText(t); alert('Kopieret!'); },
        initMap() { if(!window.d3Active) { window.initD3(); window.d3Active = true; } }
    }
}

function utmLogic() {
    return {
        url: '', chan: 'fb_paid', type: 'oneoff', code: '', vCount: 1, links: [],
        build() {
            this.links = [];
            let base = this.url.includes('http') ? this.url : 'https://' + this.url;
            let c = {
                fb_paid: {s:'facebook', m:'paid_social'},
                fb_org: {s:'facebook', m:'organic_social'},
                li_paid: {s:'linkedin', m:'paid_social'},
                em_news: {s:'sfmc', m:'email'},
                sms_camp: {s:'sfmc', m:'sms'}
            }[this.chan];
            for(let i=1; i<=this.vCount; i++){
                let u = new URL(base);
                u.searchParams.set('utm_source', c.s);
                u.searchParams.set('utm_medium', c.m);
                if(this.code) u.searchParams.set(this.type==='felt'?'utm_campaign_code_recurring':'utm_campaign_code', this.code);
                if(this.vCount > 1) u.searchParams.set('utm_content', 'v'+i);
                this.links.push({url: u.toString()});
            }
        }
    }
}

function extLogic() {
    return { 
        inp: '', 
        res: [], 
        run() { 
            try { 
                let u = new URL(this.inp.includes('http')?this.inp:'https://'+this.inp); 
                this.res = Array.from(u.searchParams.entries()).map(([k,v])=>({k,v})); 
            } catch(e){alert('Ugyldig URL');} 
        } 
    }
}
