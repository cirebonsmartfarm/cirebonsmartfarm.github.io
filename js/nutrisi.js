/* =========================================================================
   Kalkulator nutrisi hidroponik - Cirebon Smart Farm

   Dua mode:
     A. Larutan siap pakai. Menghitung takaran pekatan A dan B untuk mengisi
        tandon sampai EC sasaran, plus koreksi tandon yang sedang berjalan.
     B. Racik sendiri. Dari sebuah resep ppm, menghitung gram tiap pupuk
        tunggal untuk sekian liter pekatan, dipisah ke Tangki A dan Tangki B
        supaya kalsium tidak bertemu sulfat dan fosfat selama masih pekat.

   Semua hitungan berjalan di peramban pengunjung. Tidak ada data yang dikirim.
   Resep buatan sendiri disimpan di peramban perangkat ini saja.
   ========================================================================= */
(function () {
  'use strict';

  var akar = document.getElementById('kalkulator-nutrisi');
  if (!akar) return;

  var KUNCI_SIMPAN = 'csf-resep-nutrisi-v1';

  /* ---------------------------------------------------------------------
     Resep bawaan.
     Kelompok "Tanaman" adalah sasaran kerja susunan Cirebon Smart Farm.
     Kelompok "Rujukan klasik" adalah larutan yang lazim dikutip di pustaka
     hidroponik. Angkanya versi kekuatan penuh yang paling sering diterbitkan.
     ec dan ph hanya dipakai sebagai pengingat, tidak masuk hitungan.
     --------------------------------------------------------------------- */
  var TANAMAN = [
    { id: 'semai', nama: 'Semai / bibit (semua jenis)', ec: [0.5, 0.8], ph: [5.5, 6.0],
      hara: { N: 70,  P: 25, K: 100, Ca: 80,  Mg: 25, S: 30 } },
    { id: 'selada', nama: 'Selada', ec: [0.8, 1.2], ph: [5.5, 6.5],
      hara: { N: 150, P: 45, K: 200, Ca: 150, Mg: 45, S: 55 } },
    { id: 'pakcoy', nama: 'Pakcoy / sawi', ec: [1.5, 2.0], ph: [5.5, 6.5],
      hara: { N: 180, P: 50, K: 240, Ca: 170, Mg: 50, S: 65 } },
    { id: 'kangkung', nama: 'Kangkung', ec: [1.5, 2.0], ph: [5.5, 6.5],
      hara: { N: 180, P: 45, K: 230, Ca: 160, Mg: 45, S: 60 } },
    { id: 'bayam', nama: 'Bayam', ec: [1.8, 2.3], ph: [6.0, 6.5],
      hara: { N: 190, P: 50, K: 250, Ca: 180, Mg: 50, S: 65 } },
    { id: 'seledri', nama: 'Seledri', ec: [1.8, 2.4], ph: [6.0, 6.5],
      hara: { N: 190, P: 55, K: 260, Ca: 190, Mg: 55, S: 70 } },
    { id: 'kemangi', nama: 'Kemangi / basil', ec: [1.0, 1.6], ph: [5.5, 6.5],
      hara: { N: 150, P: 45, K: 200, Ca: 150, Mg: 45, S: 55 } },
    { id: 'melon-v', nama: 'Melon - fase vegetatif', ec: [1.8, 2.2], ph: [5.8, 6.2],
      hara: { N: 190, P: 50, K: 240, Ca: 170, Mg: 50, S: 60 } },
    { id: 'melon-g', nama: 'Melon - fase generatif', ec: [2.4, 3.0], ph: [5.8, 6.2],
      hara: { N: 180, P: 55, K: 330, Ca: 180, Mg: 55, S: 70 } },
    { id: 'tomat-v', nama: 'Tomat - fase vegetatif', ec: [2.0, 2.5], ph: [5.5, 6.5],
      hara: { N: 190, P: 50, K: 250, Ca: 170, Mg: 50, S: 60 } },
    { id: 'tomat-g', nama: 'Tomat - fase generatif', ec: [2.5, 3.5], ph: [5.5, 6.5],
      hara: { N: 180, P: 55, K: 340, Ca: 190, Mg: 55, S: 75 } },
    { id: 'cabai', nama: 'Cabai', ec: [2.0, 3.0], ph: [5.5, 6.5],
      hara: { N: 180, P: 55, K: 300, Ca: 180, Mg: 50, S: 70 } },
    { id: 'timun', nama: 'Timun', ec: [1.7, 2.5], ph: [5.5, 6.0],
      hara: { N: 190, P: 50, K: 260, Ca: 170, Mg: 50, S: 60 } },
    { id: 'terong', nama: 'Terong', ec: [2.5, 3.5], ph: [5.5, 6.5],
      hara: { N: 190, P: 55, K: 300, Ca: 180, Mg: 55, S: 70 } },
    { id: 'stroberi', nama: 'Stroberi', ec: [1.4, 2.0], ph: [5.5, 6.5],
      hara: { N: 150, P: 50, K: 220, Ca: 160, Mg: 50, S: 60 } },
    { id: 'buncis', nama: 'Buncis / kacang panjang', ec: [2.0, 3.0], ph: [6.0, 6.5],
      hara: { N: 170, P: 50, K: 240, Ca: 170, Mg: 50, S: 60 } }
  ];

  var KLASIK = [
    { id: 'hoagland', nama: 'Hoagland & Arnon (1950), kekuatan penuh',
      ec: [2.0, 2.6], ph: [5.5, 6.5],
      hara: { N: 210, P: 31, K: 235, Ca: 200, Mg: 48, S: 64 },
      mikro: { Fe: 3.0, Mn: 0.5, Zn: 0.05, B: 0.5, Cu: 0.02, Mo: 0.01 } },
    { id: 'steiner', nama: 'Larutan Steiner (1961)',
      ec: [1.8, 2.4], ph: [6.0, 6.5],
      hara: { N: 168, P: 31, K: 273, Ca: 180, Mg: 48, S: 96 },
      mikro: { Fe: 3.0, Mn: 0.62, Zn: 0.11, B: 0.44, Cu: 0.02, Mo: 0.05 } }
  ];

  /* Sasaran hara mikro bawaan bila resep tidak membawa angkanya sendiri. */
  var MIKRO_BAWAAN = { Fe: 3.0, Mn: 0.5, Zn: 0.25, B: 0.5, Cu: 0.05, Mo: 0.05 };

  /* ---------------------------------------------------------------------
     Pupuk tunggal yang lazim dijual di Indonesia.
     Persentase memakai angka pada label dagang, bukan kemurnian teoretis,
     karena itu yang tertera di karung yang Anda beli.
     tangki: 'A' untuk yang mengandung kalsium, 'B' untuk sulfat dan fosfat.
     --------------------------------------------------------------------- */
  var PUPUK = {
    kalnit:  { nama: 'Kalsium Nitrat (Calnit)', rumus: '5Ca(NO3)2 &middot; NH4NO3 &middot; 10H2O',
               label: '15,5% N &middot; 26,5% CaO', unsur: { N: 15.5, Ca: 19.0 }, tangki: 'A',
               sumber: 'Yara, YaraLiva' },
    kno3:    { nama: 'Kalium Nitrat (KNO3 / Kalinitra)', rumus: 'KNO3',
               label: '13% N &middot; 46% K2O', unsur: { N: 13.0, K: 38.2 }, tangki: 'A',
               sumber: 'label dagang 13-0-46. Garam murni menurut Yara 13,7% N dan 38,6% K' },
    mkp:     { nama: 'MKP', rumus: 'KH2PO4',
               label: '52% P2O5 &middot; 34% K2O', unsur: { P: 22.7, K: 28.2 }, tangki: 'B',
               sumber: 'label dagang 0-52-34. Garam murni menurut Yara 22,7% P dan 28,7% K' },
    mgso4:   { nama: 'Magnesium Sulfat (garam Inggris)', rumus: 'MgSO4 &middot; 7H2O',
               label: '16% MgO &middot; 13% S', unsur: { Mg: 9.7, S: 13.0 }, tangki: 'B',
               sumber: 'Yara' },
    k2so4:   { nama: 'Kalium Sulfat (ZK)', rumus: 'K2SO4',
               label: '50% K2O &middot; 17% S', unsur: { K: 41.5, S: 17.0 }, tangki: 'B',
               sumber: 'Petrokimia Gresik, ZK' },
    za:      { nama: 'Amonium Sulfat (ZA)', rumus: '(NH4)2SO4',
               label: '20,8% N &middot; 23,8% S', unsur: { N: 20.8, S: 23.8 }, tangki: 'B',
               sumber: 'Petrokimia Gresik, ZA' },
    feedta:  { nama: 'Fe-EDTA 13%', rumus: 'C10H12FeN2NaO8',
               label: '13% Fe', unsur: { Fe: 13.0 }, tangki: 'A', sumber: 'Yara' },
    mnso4:   { nama: 'Mangan Sulfat', rumus: 'MnSO4 &middot; H2O',
               label: '32,5% Mn', unsur: { Mn: 32.5 }, tangki: 'B', sumber: 'stoikiometri' },
    znso4:   { nama: 'Seng Sulfat', rumus: 'ZnSO4 &middot; 7H2O',
               label: '22,7% Zn', unsur: { Zn: 22.7 }, tangki: 'B', sumber: 'stoikiometri' },
    cuso4:   { nama: 'Tembaga Sulfat', rumus: 'CuSO4 &middot; 5H2O',
               label: '25,5% Cu', unsur: { Cu: 25.5 }, tangki: 'B', sumber: 'stoikiometri' },
    borax:   { nama: 'Borax', rumus: 'Na2B4O7 &middot; 10H2O',
               label: '11,3% B', unsur: { B: 11.3 }, tangki: 'B', sumber: 'Yara' },
    namo:    { nama: 'Natrium Molibdat', rumus: 'Na2MoO4 &middot; 2H2O',
               label: '39,6% Mo', unsur: { Mo: 39.6 }, tangki: 'B', sumber: 'Yara' }
  };

  /* Kadar boleh ditimpa pengguna, karena tiap merek dan pabrik berbeda.
     Kalau kolomnya kosong atau tidak ada, dipakai angka bawaan di atas. */
  var KADAR_UBAH = {
    kalnit: ['N', 'Ca'], kno3: ['N', 'K'], mkp: ['P', 'K'],
    mgso4: ['Mg', 'S'], k2so4: ['K', 'S'], za: ['N', 'S']
  };

  function kadar(kode, unsur) {
    var e = document.getElementById('k-' + kode + '-' + unsur);
    if (e) {
      var v = parseFloat(e.value);
      if (isFinite(v) && v > 0) return v;
    }
    return PUPUK[kode].unsur[unsur];
  }

  var URUT_HARA = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
  var URUT_MIKRO = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  var NAMA_UNSUR = {
    N: 'Nitrogen', P: 'Fosfor', K: 'Kalium', Ca: 'Kalsium', Mg: 'Magnesium', S: 'Belerang',
    Fe: 'Besi', Mn: 'Mangan', Zn: 'Seng', B: 'Boron', Cu: 'Tembaga', Mo: 'Molibdenum'
  };

  /* ---------------------------------------------------------------------
     Bantuan format
     --------------------------------------------------------------------- */
  var nf1 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nf0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

  function el(id) { return document.getElementById(id); }
  function num(id) {
    var e = el(id);
    if (!e) return 0;
    var v = parseFloat(e.value);
    return isFinite(v) && v >= 0 ? v : 0;
  }
  function gram(g) {
    if (!g || g <= 0) return '0 g';
    if (g < 1) return nf0.format(g * 1000) + ' mg';
    if (g < 10) return nf2.format(g) + ' g';
    return nf2.format(g) + ' g';
  }
  function ppm(v) {
    if (v >= 10) return nf0.format(v);
    if (v >= 1) return nf2.format(v);
    return nf1.format(v * 1000) / 1000 ? nf2.format(v) : nf2.format(v);
  }

  /* ---------------------------------------------------------------------
     Resep buatan pengguna, disimpan di peramban
     --------------------------------------------------------------------- */
  function bacaSimpanan() {
    try {
      var d = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || '[]');
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }
  function tulisSimpanan(daftar) {
    try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(daftar)); }
    catch (e) { /* mode privat atau penyimpanan diblokir */ }
  }

  function semuaResep() {
    return { tanaman: TANAMAN, klasik: KLASIK, simpanan: bacaSimpanan() };
  }
  function cariResep(id) {
    var s = semuaResep();
    var kumpulan = s.tanaman.concat(s.klasik, s.simpanan);
    for (var i = 0; i < kumpulan.length; i++) if (kumpulan[i].id === id) return kumpulan[i];
    return TANAMAN[1];
  }

  function isiPilihanResep(pilih) {
    var sel = el('r-resep');
    var terpilih = pilih || sel.value || 'selada';
    sel.innerHTML = '';
    var s = semuaResep();

    function grup(judul, daftar) {
      if (!daftar.length) return;
      var g = document.createElement('optgroup');
      g.label = judul;
      daftar.forEach(function (r) {
        var o = document.createElement('option');
        o.value = r.id;
        o.textContent = r.nama;
        g.appendChild(o);
      });
      sel.appendChild(g);
    }
    grup('Tanaman', s.tanaman);
    grup('Rujukan klasik', s.klasik);
    grup('Resep saya', s.simpanan);

    sel.value = terpilih;
    if (!sel.value) sel.value = 'selada';
  }

  /* =====================================================================
     MODE A - larutan siap pakai
     ===================================================================== */
  ['n-tanaman'].forEach(function (idSel) {
    var sel = el(idSel);
    TANAMAN.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.id; o.textContent = t.nama;
      sel.appendChild(o);
    });
    sel.value = 'selada';
  });

  function tanamanA(id) {
    for (var i = 0; i < TANAMAN.length; i++) if (TANAMAN[i].id === id) return TANAMAN[i];
    return TANAMAN[1];
  }

  function hitungSiapPakai() {
    var t = tanamanA(el('n-tanaman').value);
    var volume = num('n-volume');
    var skala = num('n-skala') || 500;
    var dosisAcuan = num('n-dosis-acuan');
    var ecAcuan = num('n-ec-acuan');
    var ecTarget = num('n-ec-target');

    var mlPerLiter = (ecAcuan > 0 && dosisAcuan > 0) ? (ecTarget / ecAcuan) * dosisAcuan : 0;
    var totalA = mlPerLiter * volume;

    el('n-target-info').textContent =
      'Rentang EC ' + nf1.format(t.ec[0]) + ' - ' + nf1.format(t.ec[1]) + ' mS/cm, ' +
      'pH ' + nf1.format(t.ph[0]) + ' - ' + nf1.format(t.ph[1]);

    el('n-out-ml').textContent = nf2.format(mlPerLiter) + ' ml/L';
    el('n-out-a').textContent = totalA >= 1000
      ? nf2.format(totalA / 1000) + ' liter' : nf0.format(totalA) + ' ml';
    el('n-out-b').textContent = el('n-out-a').textContent;
    el('n-out-ppm').textContent = nf0.format(ecTarget * skala) + ' ppm';
    el('n-out-ph').textContent = nf1.format(t.ph[0]) + ' - ' + nf1.format(t.ph[1]);
    el('n-out-volume').textContent = nf0.format(volume) + ' liter';

    var pesan, kelas;
    if (ecTarget <= 0) { pesan = 'Isi EC sasaran lebih dulu.'; kelas = ''; }
    else if (ecTarget < t.ec[0] * 0.9) {
      pesan = 'EC sasaran di bawah rentang ' + t.nama.toLowerCase() +
              '. Tanaman berisiko kekurangan hara.'; kelas = 'is-warn';
    } else if (ecTarget > t.ec[1] * 1.1) {
      pesan = 'EC sasaran di atas rentang ' + t.nama.toLowerCase() +
              '. Risiko daun terbakar dan akar tertekan, apalagi saat siang panas.'; kelas = 'is-danger';
    } else if (ecTarget < t.ec[0] || ecTarget > t.ec[1]) {
      pesan = 'Sedikit di luar rentang anjuran, masih bisa ditoleransi.'; kelas = 'is-warn';
    } else {
      pesan = 'Sesuai rentang anjuran untuk ' + t.nama.toLowerCase() + '.'; kelas = 'is-ok';
    }
    el('n-status-teks').textContent = pesan;
    el('n-status').className = 'calc-badge ' + kelas;

    hitungKoreksi(ecAcuan, dosisAcuan);
  }

  function hitungKoreksi(ecAcuan, dosisAcuan) {
    var volume = num('n-k-volume');
    var ecSekarang = num('n-k-ec');
    var ecMau = num('n-ec-target');
    var beda = ecMau - ecSekarang;
    var baris = el('n-koreksi-hasil');

    if (volume <= 0 || ecSekarang <= 0 || ecMau <= 0) {
      baris.innerHTML = '<p class="calc-note">Isi volume air dan EC terukur untuk melihat koreksinya.</p>';
      return;
    }
    if (beda > 0.02) {
      var mlTambah = (beda / ecAcuan) * dosisAcuan * volume;
      baris.innerHTML =
        '<div class="calc-row"><dt>Selisih EC</dt><dd>+' + nf2.format(beda) + ' mS/cm</dd></div>' +
        '<div class="calc-row calc-row-strong"><dt>Tambah pekatan A</dt><dd>' + nf0.format(mlTambah) + ' ml</dd></div>' +
        '<div class="calc-row calc-row-strong"><dt>Tambah pekatan B</dt><dd>' + nf0.format(mlTambah) + ' ml</dd></div>' +
        '<p class="calc-note">Tuang A dulu, aduk, baru B. Jangan pernah mencampur A dan B dalam keadaan pekat.</p>';
    } else if (beda < -0.02) {
      var airTambah = volume * (ecSekarang / ecMau - 1);
      baris.innerHTML =
        '<div class="calc-row"><dt>Selisih EC</dt><dd>' + nf2.format(beda) + ' mS/cm</dd></div>' +
        '<div class="calc-row calc-row-strong"><dt>Tambah air tawar</dt><dd>' + nf0.format(airTambah) + ' liter</dd></div>' +
        '<p class="calc-note">EC yang terlalu tinggi hanya bisa diturunkan dengan air, bukan dengan pupuk. ' +
        'Volume tandon akan naik jadi ' + nf0.format(volume + airTambah) + ' liter.</p>';
    } else {
      baris.innerHTML =
        '<div class="calc-row calc-row-strong"><dt>Status</dt><dd>Sudah pas</dd></div>' +
        '<p class="calc-note">EC terukur sudah sesuai sasaran. Cukup jaga volume air tetap penuh.</p>';
    }
  }

  /* =====================================================================
     MODE B - racik dari pupuk tunggal
     ===================================================================== */

  function muatResep() {
    var r = cariResep(el('r-resep').value);
    URUT_HARA.forEach(function (u) { el('r-' + u).value = r.hara[u]; });
    var mk = r.mikro || MIKRO_BAWAAN;
    URUT_MIKRO.forEach(function (u) { el('r-m-' + u).value = mk[u]; });
    el('r-target-info').textContent = r.ec
      ? 'Acuan EC ' + nf1.format(r.ec[0]) + ' - ' + nf1.format(r.ec[1]) + ' mS/cm, pH ' +
        nf1.format(r.ph[0]) + ' - ' + nf1.format(r.ph[1])
      : 'Resep simpanan Anda sendiri.';
    el('r-hapus-resep').hidden = !r.milikSaya;
    hitungRacikan();
  }

  function bacaSasaran() {
    var persen = (num('r-konsentrasi') || 100) / 100;
    var makro = {}, mikro = {};
    URUT_HARA.forEach(function (u) { makro[u] = num('r-' + u) * persen; });
    URUT_MIKRO.forEach(function (u) { mikro[u] = num('r-m-' + u) * persen; });
    return { makro: makro, mikro: mikro, persen: persen };
  }

  function hitungRacikan() {
    var faktor = num('r-faktor') || 100;
    var volStok = num('r-vol-stok');
    var pakaiZA = el('r-pakai-za').checked;
    var mikroCampuran = el('r-mikro-campuran').checked;

    /* Satu tangki stok sebanyak volStok liter, diencerkan faktor kali,
       menghasilkan sekian liter larutan kerja. Itu dasar semua takaran. */
    var volume = volStok * faktor;
    if (volume <= 0) return;

    var s = bacaSasaran();
    var mgTarget = {};
    URUT_HARA.forEach(function (u) { mgTarget[u] = s.makro[u] * volume; });

    var g = {}, catatan = [];

    /* 1. Kalsium lebih dulu, hanya kalsium nitrat sumbernya. */
    g.kalnit = mgTarget.Ca / (kadar('kalnit', 'Ca') * 10);
    var nDariKalnit = g.kalnit * kadar('kalnit', 'N') * 10;

    /* 2. Fosfor seluruhnya dari MKP. */
    g.mkp = mgTarget.P / (kadar('mkp', 'P') * 10);
    var kDariMkp = g.mkp * kadar('mkp', 'K') * 10;

    /* 3. Magnesium dari garam Inggris. */
    g.mgso4 = mgTarget.Mg / (kadar('mgso4', 'Mg') * 10);

    /* 4. Sisa nitrogen ditutup KNO3, yang sekaligus menyumbang kalium. */
    var nSisa = mgTarget.N - nDariKalnit;
    if (nSisa < 0) {
      catatan.push('Kalsium nitrat saja sudah melebihi sasaran nitrogen. ' +
                   'Turunkan sasaran Ca atau naikkan sasaran N.');
      nSisa = 0;
    }
    g.kno3 = nSisa / (kadar('kno3', 'N') * 10);
    var kDariKno3 = g.kno3 * kadar('kno3', 'K') * 10;

    /* 5. Kalium disetarakan. Kelebihan berarti KNO3 harus dipangkas. */
    var kSisa = mgTarget.K - kDariMkp - kDariKno3;
    g.k2so4 = 0; g.za = 0;
    if (kSisa >= 0) {
      g.k2so4 = kSisa / (kadar('k2so4', 'K') * 10);
    } else {
      var kBoleh = mgTarget.K - kDariMkp;
      if (kBoleh < 0) {
        catatan.push('MKP saja sudah melebihi sasaran kalium. Turunkan sasaran P atau naikkan sasaran K.');
        kBoleh = 0;
      }
      g.kno3 = kBoleh / (kadar('kno3', 'K') * 10);
      var nKurang = mgTarget.N - nDariKalnit - g.kno3 * kadar('kno3', 'N') * 10;
      if (nKurang > 0) {
        if (pakaiZA) {
          g.za = nKurang / (kadar('za', 'N') * 10);
        } else {
          catatan.push('Nitrogen kurang sekitar ' + nf0.format(nKurang / volume) +
                       ' ppm karena kalium sudah penuh. Centang ZA untuk menutupnya, ' +
                       'atau turunkan sasaran kalium.');
        }
      }
    }

    /* Batas amonium. Terlalu banyak NH4 menekan serapan kalsium. */
    var nTotal = nDariKalnit + g.kno3 * kadar('kno3', 'N') * 10 + g.za * kadar('za', 'N') * 10;
    var nAmonium = g.kalnit * 1.1 * 10 + g.za * kadar('za', 'N') * 10;
    var persenAmonium = nTotal > 0 ? (nAmonium / nTotal) * 100 : 0;
    if (persenAmonium > 15) {
      catatan.push('Nitrogen bentuk amonium mencapai ' + nf0.format(persenAmonium) +
                   ' persen dari total N. Di atas 15 persen berisiko memicu busuk ujung buah. Kurangi ZA.');
    }

    /* 6. Hara mikro. Dua jalur: garam terpisah, atau campuran siap pakai. */
    var dapatMikro = {};
    var campuran = null;

    if (mikroCampuran) {
      var pct = {};
      URUT_MIKRO.forEach(function (u) { pct[u] = num('r-c-' + u); });
      if (pct.Fe > 0) {
        /* Besi jadi jangkar karena kebutuhannya paling besar. */
        var dosis = (s.mikro.Fe * volume) / (pct.Fe * 10);
        campuran = { gram: dosis, pct: pct };
        URUT_MIKRO.forEach(function (u) {
          dapatMikro[u] = (dosis * pct[u] * 10) / volume;
        });
        var meleset = URUT_MIKRO.filter(function (u) {
          return u !== 'Fe' && s.mikro[u] > 0 &&
                 Math.abs(dapatMikro[u] - s.mikro[u]) / s.mikro[u] > 0.25;
        });
        if (meleset.length) {
          catatan.push('Campuran mikro dikunci pada besi, jadi ' + meleset.join(', ') +
                       ' ikut nilai bawaan campuran dan meleset dari sasaran. ' +
                       'Itu biasa terjadi pada produk mikro siap pakai.');
        }
      } else {
        catatan.push('Isi kadar besi pada campuran mikro Anda, itu jangkar perhitungannya.');
        URUT_MIKRO.forEach(function (u) { dapatMikro[u] = 0; });
      }
    } else {
      g.feedta = (s.mikro.Fe * volume) / (kadar('feedta', 'Fe') * 10);
      g.mnso4  = (s.mikro.Mn * volume) / (kadar('mnso4', 'Mn') * 10);
      g.znso4  = (s.mikro.Zn * volume) / (kadar('znso4', 'Zn') * 10);
      g.cuso4  = (s.mikro.Cu * volume) / (kadar('cuso4', 'Cu') * 10);
      g.borax  = (s.mikro.B  * volume) / (kadar('borax', 'B') * 10);
      g.namo   = (s.mikro.Mo * volume) / (kadar('namo', 'Mo') * 10);
      URUT_MIKRO.forEach(function (u) { dapatMikro[u] = s.mikro[u]; });
    }

    /* Hasil nyata tiap unsur makro. */
    var dapat = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0 };
    Object.keys(g).forEach(function (kode) {
      var p = PUPUK[kode];
      if (!p || !g[kode]) return;
      Object.keys(p.unsur).forEach(function (u) {
        if (dapat[u] === undefined) return;
        dapat[u] += (g[kode] * kadar(kode, u) * 10) / volume;
      });
    });

    gambarRacikan(g, dapat, dapatMikro, s, volume, faktor, volStok, campuran, catatan);
  }

  function gambarRacikan(g, dapat, dapatMikro, s, volume, faktor, volStok, campuran, catatan) {
    var mlPerLiter = faktor > 0 ? 1000 / faktor : 0;

    el('r-out-dosis').textContent = nf1.format(mlPerLiter) + ' ml/L';
    el('r-out-stok').textContent = nf1.format(volStok) + ' L per tangki';
    el('r-out-cukup').textContent = nf0.format(volume) + ' liter larutan kerja';

    /* Tabel takaran per tangki. Angka gram adalah untuk satu tangki pekatan. */
    function tabel(tangki) {
      var baris = '', total = 0;
      Object.keys(PUPUK).forEach(function (kode) {
        var p = PUPUK[kode];
        if (p.tangki !== tangki || !g[kode] || g[kode] <= 0) return;
        total += g[kode];
        baris +=
          '<tr>' +
            '<td data-label="Pupuk"><strong>' + p.nama + '</strong>' +
              '<span class="pupuk-rumus">' + p.rumus + ' &middot; ' + p.label + '</span></td>' +
            '<td data-label="Tipe"><span class="tipe-tanda ' + tangki.toLowerCase() + '">' + tangki + '</span></td>' +
            '<td data-label="Berat">' + gram(g[kode]) + '</td>' +
          '</tr>';
      });
      /* Campuran mikro siap pakai selalu masuk tangki B. */
      if (campuran && tangki === 'B') {
        total += campuran.gram;
        var isi = URUT_MIKRO.filter(function (u) { return campuran.pct[u] > 0; })
          .map(function (u) { return u + ' ' + nf2.format(campuran.pct[u]) + '%'; }).join(' &middot; ');
        baris +=
          '<tr>' +
            '<td data-label="Pupuk"><strong>Campuran mikro siap pakai</strong>' +
              '<span class="pupuk-rumus">' + (isi || 'kadar belum diisi') + '</span></td>' +
            '<td data-label="Tipe"><span class="tipe-tanda b">B</span></td>' +
            '<td data-label="Berat">' + gram(campuran.gram) + '</td>' +
          '</tr>';
      }
      if (!baris) baris = '<tr><td colspan="3" data-label="Catatan">Tidak ada pupuk di tangki ini.</td></tr>';
      return { baris: baris, total: total };
    }

    var A = tabel('A'), B = tabel('B');
    el('r-tabel-a').innerHTML = A.baris;
    el('r-tabel-b').innerHTML = B.baris;
    el('r-total-a').textContent = gram(A.total);
    el('r-total-b').textContent = gram(B.total);
    el('r-out-berat-a').textContent = gram(A.total);
    el('r-out-berat-b').textContent = gram(B.total);
    el('r-out-berat').textContent = gram(A.total + B.total);

    /* Sasaran dibanding hasil, plus skor kecocokan. */
    var cek = '', skor = [], totalTargetPpm = 0, totalHasilPpm = 0;

    function baris(u, target, hasil, kelasBaris) {
      totalTargetPpm += target;
      totalHasilPpm += hasil;
      var beda = hasil - target;
      var persen = target > 0 ? (beda / target) * 100 : 0;

      /* Belerang hampir selalu berlebih karena terbawa MgSO4 dan K2SO4.
         Itu tidak merugikan tanaman, jadi tidak dihitung sebagai meleset. */
      var akurasi;
      if (u === 'S' && beda > 0) akurasi = 100;
      else akurasi = Math.max(0, 100 - Math.abs(persen));
      skor.push(akurasi);

      var kelas;
      if (u === 'S' && persen > 0) kelas = persen <= 120 ? 'pas' : 'dekat';
      else kelas = Math.abs(persen) <= 5 ? 'pas' : (Math.abs(persen) <= 15 ? 'dekat' : 'jauh');

      var tanda = beda >= 0 ? '+' : '';
      var fmt = target >= 10 ? nf0 : nf2;
      cek +=
        '<tr' + (kelasBaris ? ' class="' + kelasBaris + '"' : '') + '>' +
          '<td data-label="Unsur"><strong>' + u + '</strong>' +
            '<span class="pupuk-rumus">' + NAMA_UNSUR[u] + '</span></td>' +
          '<td data-label="Sasaran">' + fmt.format(target) + '</td>' +
          '<td data-label="Hasil">' + fmt.format(hasil) + '</td>' +
          '<td data-label="Selisih"><span class="delta ' + kelas + '">' +
            tanda + nf1.format(persen) + '%</span></td>' +
        '</tr>';
    }

    URUT_HARA.forEach(function (u) { baris(u, s.makro[u], dapat[u] || 0, ''); });
    URUT_MIKRO.forEach(function (u) { baris(u, s.mikro[u], dapatMikro[u] || 0, 'mikro'); });

    cek +=
      '<tr class="baris-total">' +
        '<td data-label="Unsur"><strong>Total PPM</strong></td>' +
        '<td data-label="Sasaran">' + nf0.format(totalTargetPpm) + '</td>' +
        '<td data-label="Hasil">' + nf0.format(totalHasilPpm) + '</td>' +
        '<td data-label="Selisih"></td>' +
      '</tr>';
    el('r-tabel-cek').innerHTML = cek;

    var rata = skor.reduce(function (a, b) { return a + b; }, 0) / skor.length;
    el('r-out-skor').textContent = nf2.format(rata) + '%';
    var badge = el('r-skor-badge');
    badge.className = 'calc-badge ' + (rata >= 97 ? 'is-ok' : rata >= 90 ? '' : rata >= 75 ? 'is-warn' : 'is-danger');
    el('r-skor-teks').textContent =
      rata >= 97 ? 'Racikan sangat mendekati resep.' :
      rata >= 90 ? 'Cukup baik. Periksa unsur yang ditandai kuning.' :
      rata >= 75 ? 'Ada unsur yang meleset jauh. Sesuaikan sasaran atau sumber pupuknya.' :
                   'Resep ini sulit dicapai dengan pupuk yang dipilih. Ubah sasarannya.';

    var kotak = el('r-catatan');
    if (catatan.length) {
      kotak.style.display = '';
      kotak.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i><div>' +
        catatan.map(function (c) { return '<p>' + c + '</p>'; }).join('') + '</div>';
    } else {
      kotak.style.display = 'none';
      kotak.innerHTML = '';
    }
  }

  /* =====================================================================
     Simpan dan hapus resep sendiri
     ===================================================================== */
  el('r-simpan-resep').addEventListener('click', function () {
    var nama = (el('r-nama-resep').value || '').trim();
    if (!nama) {
      el('r-nama-resep').focus();
      return;
    }
    var resep = {
      id: 'saya-' + Date.now().toString(36),
      nama: nama,
      milikSaya: true,
      hara: {}, mikro: {}
    };
    URUT_HARA.forEach(function (u) { resep.hara[u] = num('r-' + u); });
    URUT_MIKRO.forEach(function (u) { resep.mikro[u] = num('r-m-' + u); });

    var daftar = bacaSimpanan();
    daftar.push(resep);
    tulisSimpanan(daftar);
    el('r-nama-resep').value = '';
    isiPilihanResep(resep.id);
    muatResep();
  });

  el('r-hapus-resep').addEventListener('click', function () {
    var id = el('r-resep').value;
    var daftar = bacaSimpanan().filter(function (r) { return r.id !== id; });
    tulisSimpanan(daftar);
    isiPilihanResep('selada');
    muatResep();
  });

  el('r-resep').addEventListener('change', muatResep);

  el('r-mikro-campuran').addEventListener('change', function () {
    el('r-campuran-kolom').hidden = !this.checked;
    hitungRacikan();
  });

  /* =====================================================================
     Tabel rujukan
     ===================================================================== */
  (function tabelRujukan() {
    var t = el('tabel-pupuk');
    if (!t) return;
    var html = '';
    Object.keys(PUPUK).forEach(function (kode) {
      var p = PUPUK[kode];
      var unsur = Object.keys(p.unsur).map(function (u) {
        return u + ' ' + nf1.format(p.unsur[u]) + '%';
      }).join(' &middot; ');
      html +=
        '<tr>' +
          '<td data-label="Pupuk"><strong>' + p.nama + '</strong></td>' +
          '<td data-label="Rumus">' + p.rumus + '</td>' +
          '<td data-label="Label dagang">' + p.label + '</td>' +
          '<td data-label="Unsur terhitung">' + unsur + '</td>' +
          '<td data-label="Tangki">' + p.tangki + '</td>' +
          '<td data-label="Sumber angka">' + (p.sumber || '-') + '</td>' +
        '</tr>';
    });
    t.innerHTML = html;
  })();

  (function tabelTanaman() {
    var t = el('tabel-tanaman');
    if (!t) return;
    var html = '';
    TANAMAN.forEach(function (p) {
      html +=
        '<tr>' +
          '<td data-label="Tanaman"><strong>' + p.nama + '</strong></td>' +
          '<td data-label="EC">' + nf1.format(p.ec[0]) + ' - ' + nf1.format(p.ec[1]) + '</td>' +
          '<td data-label="PPM (skala 500)">' + nf0.format(p.ec[0] * 500) + ' - ' + nf0.format(p.ec[1] * 500) + '</td>' +
          '<td data-label="PPM (skala 700)">' + nf0.format(p.ec[0] * 700) + ' - ' + nf0.format(p.ec[1] * 700) + '</td>' +
          '<td data-label="pH">' + nf1.format(p.ph[0]) + ' - ' + nf1.format(p.ph[1]) + '</td>' +
        '</tr>';
    });
    t.innerHTML = html;
  })();

  /* =====================================================================
     Tab
     ===================================================================== */
  var tombolTab = Array.prototype.slice.call(akar.querySelectorAll('.tab-btn'));
  tombolTab.forEach(function (b) {
    b.addEventListener('click', function () {
      tombolTab.forEach(function (x) {
        x.classList.toggle('aktif', x === b);
        x.setAttribute('aria-selected', x === b ? 'true' : 'false');
      });
      akar.querySelectorAll('.tab-panel').forEach(function (p) {
        p.hidden = (p.id !== b.dataset.panel);
      });
    });
  });

  /* =====================================================================
     Pemasangan pendengar dan nilai awal
     ===================================================================== */
  el('n-tanaman').addEventListener('change', function () {
    var t = tanamanA(this.value);
    el('n-ec-target').value = ((t.ec[0] + t.ec[1]) / 2).toFixed(1);
    hitungSiapPakai();
  });

  akar.querySelectorAll('#panel-siap input, #panel-siap select').forEach(function (i) {
    i.addEventListener('input', hitungSiapPakai);
  });
  akar.querySelectorAll('#panel-racik input, #panel-racik select').forEach(function (i) {
    if (i.id === 'r-resep' || i.id === 'r-nama-resep') return;
    i.addEventListener('input', hitungRacikan);
  });

  (function mulai() {
    var t = tanamanA('selada');
    el('n-ec-target').value = ((t.ec[0] + t.ec[1]) / 2).toFixed(1);
    hitungSiapPakai();
    isiPilihanResep('selada');
    muatResep();
  })();
})();
