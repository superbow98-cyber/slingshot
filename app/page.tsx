"use client";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream:   #f5f0e8;
          --cream2:  #ede7da;
          --ink:     #1a1612;
          --muted:   #8a7f72;
          --gold:    #c89440;
          --rose:    #c45c6a;
          --rose-lt: #f5e0e3;
          --dark:    #1d1a16;
          --serif:   'Playfair Display', Georgia, serif;
          --sans:    'DM Sans', system-ui, sans-serif;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: var(--sans);
          background: var(--cream);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          background: rgba(245,240,232,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(26,22,18,0.08);
        }
        .nav-logo { font-family: var(--serif); font-weight: 600; font-size: 20px; color: var(--ink); }
        .nav-logo span { color: var(--rose); font-style: italic; font-weight: 400; }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a { font-size: 13px; font-weight: 400; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--ink); }
        .nav-cta { font-size: 13px; font-weight: 500; color: #fff; background: var(--ink); padding: 9px 22px; border-radius: 100px; text-decoration: none; }

        /* HERO */
        .hero { background: var(--cream); padding: 88px 48px 96px; text-align: center; }
        .hero-inner { max-width: 760px; margin: 0 auto; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--rose); background: var(--rose-lt); padding: 6px 18px; border-radius: 100px; margin-bottom: 36px;
        }
        .hero-pill::before { content: '●'; font-size: 7px; }
        h1 {
          font-family: var(--serif); font-weight: 600;
          font-size: clamp(44px, 6.5vw, 76px); line-height: 1.07; letter-spacing: -1.5px;
          color: var(--ink); margin-bottom: 10px;
        }
        h1 em { font-style: italic; font-weight: 400; color: var(--rose); }
        .hero-sub { font-size: 17px; font-weight: 300; line-height: 1.7; color: var(--muted); max-width: 480px; margin: 0 auto 48px; }
        .hero-sub em { font-style: italic; color: var(--ink); font-weight: 400; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 64px; }
        .btn-dark {
          font-family: var(--sans); font-size: 14px; font-weight: 500;
          color: #fff; background: var(--ink); padding: 14px 32px; border-radius: 100px;
          text-decoration: none; border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.18s; display: inline-block;
        }
        .btn-dark:hover { opacity: 0.82; transform: translateY(-1px); }
        .btn-outline {
          font-family: var(--sans); font-size: 14px; font-weight: 400;
          color: var(--ink); background: transparent; padding: 13px 28px; border-radius: 100px;
          text-decoration: none; border: 1.5px solid rgba(26,22,18,0.2);
          cursor: pointer; transition: border-color 0.2s; display: inline-block;
        }
        .btn-outline:hover { border-color: rgba(26,22,18,0.5); }
        .stats { display: flex; justify-content: center; gap: 56px; border-top: 1px solid rgba(26,22,18,0.1); padding-top: 40px; }
        .stat-val { font-family: var(--serif); font-weight: 600; font-size: 26px; color: var(--ink); line-height: 1; margin-bottom: 6px; }
        .stat-val.rose { color: var(--rose); }
        .stat-val.gold { color: var(--gold); font-style: italic; font-weight: 400; }
        .stat-label { font-size: 11px; font-weight: 400; color: var(--muted); }

        /* SECTIONS */
        section { width: 100%; padding: 96px 48px; }
        .sec-inner { max-width: 820px; margin: 0 auto; }
        .s-label { font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase; color: var(--rose); margin-bottom: 20px; }
        h2 {
          font-family: var(--serif); font-weight: 600;
          font-size: clamp(32px, 4vw, 50px); line-height: 1.1; letter-spacing: -0.8px;
          color: var(--ink); margin-bottom: 16px;
        }
        h2 em { font-style: italic; font-weight: 400; }
        .sec-body { font-size: 15px; font-weight: 300; line-height: 1.75; color: var(--muted); max-width: 520px; }

        /* NICHES */
        .sec-niches { background: var(--cream2); }
        .sec-niches .sec-body { margin-bottom: 52px; }
        .niches-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .niche { background: var(--cream); border-radius: 14px; padding: 24px 20px; border: 1px solid rgba(26,22,18,0.07); transition: border-color 0.2s; }
        .niche:hover { border-color: rgba(26,22,18,0.18); }
        .n-num { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; color: var(--gold); margin-bottom: 10px; }
        .n-name { font-family: var(--serif); font-weight: 600; font-size: 17px; color: var(--ink); margin-bottom: 5px; }
        .n-desc { font-size: 11px; font-weight: 300; color: var(--muted); line-height: 1.45; }

        /* HOW */
        .sec-how { background: var(--dark); }
        .sec-how .s-label { color: var(--gold); }
        .sec-how h2 { color: #fff; }
        .sec-how .sec-body { color: rgba(255,255,255,0.4); margin-bottom: 52px; }
        .steps { display: flex; flex-direction: column; }
        .step { display: grid; grid-template-columns: 72px 1fr; gap: 0 40px; padding: 44px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .step:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
        .step-num { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: 44px; color: rgba(255,255,255,0.1); line-height: 1; padding-top: 4px; }
        .step-title { font-family: var(--serif); font-weight: 600; font-size: 22px; color: #fff; margin-bottom: 10px; }
        .step-desc { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.45); line-height: 1.7; max-width: 500px; }

        /* PRICING */
        .sec-pricing { background: var(--cream); }
        .sec-pricing .sec-body { margin-bottom: 52px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .p-card { background: #fff; border-radius: 18px; padding: 30px 24px; border: 1px solid rgba(26,22,18,0.08); transition: transform 0.2s, box-shadow 0.2s; }
        .p-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(26,22,18,0.07); }
        .p-card.featured { background: var(--ink); border-color: transparent; }
        .p-plan { font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--rose); margin-bottom: 18px; }
        .p-card.featured .p-plan { color: var(--gold); }
        .p-price { font-family: var(--serif); font-weight: 600; font-size: 36px; line-height: 1; color: var(--ink); margin-bottom: 4px; }
        .p-card.featured .p-price { color: #fff; }
        .p-period { font-size: 11px; font-weight: 300; color: var(--muted); margin-bottom: 28px; }
        .p-card.featured .p-period { color: rgba(255,255,255,0.38); }
        .p-features { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .p-features li { font-size: 12px; font-weight: 300; color: rgba(26,22,18,0.6); display: flex; gap: 9px; align-items: flex-start; line-height: 1.5; }
        .p-card.featured .p-features li { color: rgba(255,255,255,0.5); }
        .p-features li::before { content: '—'; color: var(--rose); flex-shrink: 0; }
        .p-card.featured .p-features li::before { color: var(--gold); }

        /* CTA */
        .sec-cta { background: var(--cream2); text-align: center; padding: 120px 48px; }
        .cta-h { font-family: var(--serif); font-weight: 600; font-size: clamp(38px, 5.5vw, 68px); line-height: 1.07; letter-spacing: -1px; color: var(--ink); margin-bottom: 20px; }
        .cta-h em { font-style: italic; font-weight: 400; color: var(--rose); }
        .cta-sub { font-size: 15px; font-weight: 300; color: var(--muted); margin-bottom: 44px; }

        /* FOOTER */
        footer { background: var(--dark); padding: 36px 48px; display: flex; align-items: center; justify-content: space-between; }
        .f-logo { font-family: var(--serif); font-weight: 600; font-size: 18px; color: #fff; }
        .f-logo span { color: var(--rose); font-style: italic; font-weight: 400; }
        .f-copy { font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          nav { padding: 0 24px; }
          .nav-links { display: none; }
          .hero { padding: 72px 24px 80px; }
          section { padding: 80px 24px; }
          .stats { gap: 28px; }
          .niches-grid { grid-template-columns: repeat(2, 1fr); }
          .pricing-grid { grid-template-columns: 1fr; }
          .step { grid-template-columns: 52px 1fr; gap: 0 24px; }
          footer { padding: 28px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo">Sling<span>shot</span></div>
        <ul className="nav-links">
          <li><a href="#templates">Templates</a></li>
          <li><a href="#how">Cara Guna</a></li>
          <li><a href="#pricing">Harga</a></li>
        </ul>
        <a href="/signup" className="nav-cta">Cuba Free</a>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-pill">Website Builder · Malaysia</div>
          <h1>Bisnes anda online<br />dalam <em>15 minit.</em></h1>
          <p className="hero-sub">
            12 template niche. Terima order. Bayar terus via DuitNow.<br />
            <em>Tanpa komisyen.</em>
          </p>
          <div className="hero-actions">
            <a href="/signup" className="btn-dark">Mula Percuma →</a>
            <a href="/templates" className="btn-outline">Tengok Templates</a>
          </div>
          <div className="stats">
            <div><div className="stat-val">600K+</div><div className="stat-label">Bisnes aktif</div></div>
            <div><div className="stat-val gold">Trial</div><div className="stat-label">Cuba percuma</div></div>
            <div><div className="stat-val rose">14 hari</div><div className="stat-label">Free trial</div></div>
            <div><div className="stat-val">4.9 ★</div><div className="stat-label">Rating pengguna</div></div>
          </div>
        </div>
      </div>

      {/* NICHES */}
      <section id="templates" className="sec-niches">
        <div className="sec-inner">
          <div className="s-label">12 Niche Template</div>
          <h2>Satu template untuk<br />setiap jenis bisnes.</h2>
          <p className="sec-body">
            Dari kedai makan ke klinik estetik — setiap template dibina khusus
            untuk cara bisnes tersebut beroperasi. Bukan copy-paste generic.
          </p>
          <div className="niches-grid">
            {[
              ["01","Restoran","Cart + pickup order"],
              ["02","Kafe","Specialty coffee order"],
              ["03","Klinik","Appointment booking"],
              ["04","Hartanah","Property + loan calc"],
              ["05","Auto","Showroom + trade-in"],
              ["06","Pasar Malam","Gerai quick order"],
              ["07","Event","Package + quote"],
              ["08","Catering","Kenduri bulk tempahan"],
              ["09","Bengkel","Service slot booking"],
              ["10","DFY","Discovery call booking"],
              ["11","Dental","Appointment + badge"],
              ["12","Aesthetic","Premium VIP reserve"],
            ].map(([num, name, desc]) => (
              <div key={num} className="niche">
                <div className="n-num">{num}</div>
                <div className="n-name">{name}</div>
                <div className="n-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="sec-how">
        <div className="sec-inner">
          <div className="s-label">Cara Guna</div>
          <h2 style={{ color: "#fff" }}>Dari daftar ke publish —<br /><em>dalam masa teh tarik.</em></h2>
          <p className="sec-body">Untuk anda dan pelanggan — semua dalam beberapa langkah sahaja.</p>
          <div className="steps">
            {[
              ["Pilih niche & template","Restoran, klinik, bengkel — pilih yang paling sesuai. Setiap template ada customer view, owner dashboard, KDS dan CDS."],
              ["Set brand anda","Nama, warna, logo — Slingshot generate subdomain terus. brewpickup.slingshot.my dah live dalam minit."],
              ["Tambah produk atau menu","Upload item, set harga, atur kategori. Semua dalam satu dashboard yang mudah difahami."],
              ["Terima order & bayaran","Customer order online. Bayar via DuitNow QR terus ke akaun bank anda. Zero komisyen transaksi."],
            ].map(([title, desc], i) => (
              <div key={i} className="step">
                <div className="step-num">0{i + 1}</div>
                <div>
                  <div className="step-title">{title}</div>
                  <p className="step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sec-pricing">
        <div className="sec-inner">
          <div className="s-label">Harga</div>
          <h2>Mula free.<br /><em>Scale bila ready.</em></h2>
          <p className="sec-body">Tiada hidden fees. Tiada lock-in. Cancel bila-bila masa.</p>
          <div className="pricing-grid">
            {[
              { plan:"Free", price:"RM 0", period:"selamanya", features:["1 template","20 order/bulan","Subdomain slingshot.my"], featured:false },
              { plan:"Starter", price:"RM 29", period:"sebulan", features:["12 template niche","Order unlimited","KDS + CDS live"], featured:true },
              { plan:"Pro", price:"RM 79", period:"sebulan", features:["Custom domain","5 lokasi","Analytics dashboard"], featured:false },
              { plan:"DFY", price:"RM 499", period:"one-time + RM 79/mo", features:["Kami setup semua","Domain + branding","Onboarding 1-on-1"], featured:false },
            ].map(({ plan, price, period, features, featured }) => (
              <div key={plan} className={`p-card${featured ? " featured" : ""}`}>
                <div className="p-plan">{plan}</div>
                <div className="p-price">{price}</div>
                <div className="p-period">{period}</div>
                <ul className="p-features">
                  {features.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="sec-cta">
        <h2 className="cta-h">Bisnes anda tunggu<br />apa <em>lagi?</em></h2>
        <p className="cta-sub">14 hari percuma. Tiada kad kredit diperlukan.</p>
        <a href="/signup" className="btn-dark" style={{ fontSize: "15px", padding: "16px 40px" }}>
          Daftar Sekarang →
        </a>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="f-logo">Sling<span>shot</span></div>
        <div className="f-copy">© 2026 Slingshot · Parcello Global Sdn Bhd (003842205-H)</div>
      </footer>
    </>
  );
}
