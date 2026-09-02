/* =========================================================================
   Kalkulator nutrisi hidroponik - Cirebon Smart Farm

   Dua mode:
     A. Larutan siap pakai. Menghitung takaran pekatan A dan B untuk mengisi
        tandon sampai EC sasaran, plus koreksi tandon yang sedang berjalan.
     B. Racik sendiri. Dari sebuah resep ppm, menghitung gram tiap pupuk
        tunggal untuk sekian liter pekatan, dipisah ke Tangki A dan Tangki B
        supaya kalsium tidak bertemu sulfat dan fosfat selama masih pekat.

   Semua hitungan berjalan di peramban pengunjung. Tidak ada yang dikirim maupun
   disimpan. Hasilnya dibawa keluar lewat cetak PDF, bukan lewat penyimpanan web.
   ========================================================================= */
(function () {
  'use strict';

  var akar = document.getElementById('kalkulator-nutrisi');
  if (!akar) return;

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
               beli: 'Cari sebagai: Kalsium Nitrat, Calnit, atau YaraLiva Calcinit',
               sumber: 'Yara, YaraLiva' },
    kno3:    { nama: 'Kalium Nitrat (KNO3 / Kalinitra)', rumus: 'KNO3',
               label: '13% N &middot; 46% K2O', unsur: { N: 13.0, K: 38.2 }, tangki: 'A',
               beli: 'Cari sebagai: Kalium Nitrat, KNO3, atau Kalinitra 13-0-46',
               sumber: 'label dagang 13-0-46. Garam murni menurut Yara 13,7% N dan 38,6% K' },
    mkp:     { nama: 'MKP', rumus: 'KH2PO4',
               label: '52% P2O5 &middot; 34% K2O', unsur: { P: 22.7, K: 28.2 }, tangki: 'B',
               beli: 'Cari sebagai: MKP, Mono Kalium Fosfat, atau pupuk 0-52-34',
               sumber: 'label dagang 0-52-34. Garam murni menurut Yara 22,7% P dan 28,7% K' },
    mgso4:   { nama: 'Magnesium Sulfat (garam Inggris)', rumus: 'MgSO4 &middot; 7H2O',
               label: '16% MgO &middot; 13% S', unsur: { Mg: 9.7, S: 13.0 }, tangki: 'B',
               beli: 'Cari sebagai: Garam Inggris, Magnesium Sulfat, atau MgSO4 heptahidrat',
               sumber: 'Yara' },
    k2so4:   { nama: 'Kalium Sulfat (ZK)', rumus: 'K2SO4',
               label: '50% K2O &middot; 17% S', unsur: { K: 41.5, S: 17.0 }, tangki: 'B',
               beli: 'Cari sebagai: ZK, Kalium Sulfat, atau K2SO4',
               sumber: 'Petrokimia Gresik, ZK' },
    za:      { nama: 'Amonium Sulfat (ZA)', rumus: '(NH4)2SO4',
               label: '20,8% N &middot; 23,8% S', unsur: { N: 20.8, S: 23.8 }, tangki: 'B',
               beli: 'Cari sebagai: ZA atau Amonium Sulfat',
               sumber: 'Petrokimia Gresik, ZA' },
    feedta:  { nama: 'Fe-EDTA 13%', rumus: 'C10H12FeN2NaO8',
               label: '13% Fe', unsur: { Fe: 13.0 }, tangki: 'A', sumber: 'Yara',
               beli: 'Cari sebagai: Fe-EDTA 13% atau besi kelat hidroponik' },
    mnso4:   { nama: 'Mangan Sulfat', rumus: 'MnSO4 &middot; H2O',
               label: '32,5% Mn', unsur: { Mn: 32.5 }, tangki: 'B', sumber: 'stoikiometri',
               beli: 'Cari sebagai: Mangan Sulfat monohidrat' },
    znso4:   { nama: 'Seng Sulfat', rumus: 'ZnSO4 &middot; 7H2O',
               label: '22,7% Zn', unsur: { Zn: 22.7 }, tangki: 'B', sumber: 'stoikiometri',
               beli: 'Cari sebagai: Seng Sulfat heptahidrat' },
    cuso4:   { nama: 'Tembaga Sulfat', rumus: 'CuSO4 &middot; 5H2O',
               label: '25,5% Cu', unsur: { Cu: 25.5 }, tangki: 'B', sumber: 'stoikiometri',
               beli: 'Cari sebagai: Tembaga Sulfat pentahidrat, terusi' },
    borax:   { nama: 'Borax', rumus: 'Na2B4O7 &middot; 10H2O',
               label: '11,3% B', unsur: { B: 11.3 }, tangki: 'B', sumber: 'Yara',
               beli: 'Cari sebagai: Borax atau Natrium Tetraborat' },
    namo:    { nama: 'Natrium Molibdat', rumus: 'Na2MoO4 &middot; 2H2O',
               label: '39,6% Mo', unsur: { Mo: 39.6 }, tangki: 'B', sumber: 'Yara',
               beli: 'Cari sebagai: Natrium Molibdat dihidrat' }
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

  /* Kadar menurut sumber yang berbeda. Angka Yara berasal dari tabel teknis
     terbitan Yara, angka Petrokimia dari halaman produknya sendiri, dan
     angka umum mengikuti label dagang yang lazim beredar di Indonesia. */
  var PRESET_KADAR = {
    umum: {
      nama: 'Label dagang umum Indonesia',
      nilai: { 'kalnit-N': 15.5, 'kalnit-Ca': 19, 'kno3-N': 13, 'kno3-K': 38.2,
               'mkp-P': 22.7, 'mkp-K': 28.2, 'mgso4-Mg': 9.7, 'mgso4-S': 13,
               'k2so4-K': 41.5, 'k2so4-S': 17, 'za-N': 20.8, 'za-S': 23.8 }
    },
    yara: {
      nama: 'Garam murni, tabel teknis Yara',
      nilai: { 'kalnit-N': 15.5, 'kalnit-Ca': 19, 'kno3-N': 13.7, 'kno3-K': 38.6,
               'mkp-P': 22.7, 'mkp-K': 28.7, 'mgso4-Mg': 9.7, 'mgso4-S': 13,
               'k2so4-K': 44.8, 'k2so4-S': 18.3, 'za-N': 21, 'za-S': 24 }
    },
    petro: {
      nama: 'Petrokimia Gresik untuk ZA dan ZK',
      nilai: { 'kalnit-N': 15.5, 'kalnit-Ca': 19, 'kno3-N': 13, 'kno3-K': 38.2,
               'mkp-P': 22.7, 'mkp-K': 28.2, 'mgso4-Mg': 9.7, 'mgso4-S': 13,
               'k2so4-K': 41.5, 'k2so4-S': 17, 'za-N': 20.8, 'za-S': 23.8 }
    }
  };

  function terapkanPreset(kunci) {
    var pre = PRESET_KADAR[kunci];
    if (!pre) return;                 /* pilihan 'sendiri', biarkan apa adanya */
    Object.keys(pre.nilai).forEach(function (k) {
      var e = document.getElementById('k-' + k);
      if (e) e.value = pre.nilai[k];
    });
    hitungRacikan();
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
  var nf0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  var nfSatu = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
  var nfDua = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  var nfTiga = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });

  /* Satu desimal saja, dan nol di belakang koma dibuang: 50,00 jadi 50,
     44,74 jadi 44,7. Angka di bawah 1 dikecualikan, karena hara mikro seperti
     molibdenum 0,05 ppm akan berubah jadi 0,1 ppm kalau ikut dibulatkan. */
  function rapi(v) {
    if (!isFinite(v)) return '0';
    var a = Math.abs(v);
    if (a === 0 || a >= 1) return nfSatu.format(v);
    if (a >= 0.1) return nfDua.format(v);
    return nfTiga.format(v);
  }

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
    return rapi(g) + ' g';
  }
  function ppm(v) {
    return v >= 10 ? nf0.format(v) : rapi(v);
  }

  function semuaResep() {
    return { tanaman: TANAMAN, klasik: KLASIK };
  }
  function cariResep(id) {
    var kumpulan = TANAMAN.concat(KLASIK);
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
      'Rentang EC ' + rapi(t.ec[0]) + ' - ' + rapi(t.ec[1]) + ' mS/cm, ' +
      'pH ' + rapi(t.ph[0]) + ' - ' + rapi(t.ph[1]);

    el('n-out-ml').textContent = rapi(mlPerLiter) + ' ml/L';
    el('n-out-a').textContent = totalA >= 1000
      ? rapi(totalA / 1000) + ' liter' : nf0.format(totalA) + ' ml';
    el('n-out-b').textContent = el('n-out-a').textContent;
    el('n-out-ppm').textContent = nf0.format(ecTarget * skala) + ' ppm';
    el('n-out-ph').textContent = rapi(t.ph[0]) + ' - ' + rapi(t.ph[1]);
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

    isiKopCetakA();
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
        '<div class="calc-row"><dt>Selisih EC</dt><dd>+' + rapi(beda) + ' mS/cm</dd></div>' +
        '<div class="calc-row calc-row-strong"><dt>Tambah pekatan A</dt><dd>' + nf0.format(mlTambah) + ' ml</dd></div>' +
        '<div class="calc-row calc-row-strong"><dt>Tambah pekatan B</dt><dd>' + nf0.format(mlTambah) + ' ml</dd></div>' +
        '<p class="calc-note">Tuang A dulu, aduk, baru B. Jangan pernah mencampur A dan B dalam keadaan pekat.</p>';
    } else if (beda < -0.02) {
      var airTambah = volume * (ecSekarang / ecMau - 1);
      baris.innerHTML =
        '<div class="calc-row"><dt>Selisih EC</dt><dd>' + rapi(beda) + ' mS/cm</dd></div>' +
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
      ? 'Acuan EC ' + rapi(r.ec[0]) + ' - ' + rapi(r.ec[1]) + ' mS/cm, pH ' +
        rapi(r.ph[0]) + ' - ' + rapi(r.ph[1])
      : '';
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

  /* Keterangan yang hanya muncul di hasil cetak. Nilainya diisi lewat
     textContent, bukan innerHTML, jadi tidak ada teks yang bisa jadi markup. */
  /* Daftar belanja. Membulatkan ke atas ke satuan yang wajar dibeli,
     supaya pengguna tahu berapa banyak yang perlu disiapkan. */
  function bulatBeli(g) {
    if (g <= 0) return 0;
    if (g < 50) return Math.ceil(g / 10) * 10;        /* kelipatan 10 gram */
    if (g < 1000) return Math.ceil(g / 50) * 50;      /* kelipatan 50 gram */
    return Math.ceil(g / 250) * 250;                  /* kelipatan 250 gram */
  }

  function isiBelanja(g, campuran) {
    var baris = '';
    Object.keys(PUPUK).forEach(function (kode) {
      var p = PUPUK[kode];
      if (!g[kode] || g[kode] <= 0) return;
      var beli = bulatBeli(g[kode]);
      baris +=
        '<tr>' +
          '<td data-label="Pupuk"><strong>' + p.nama + '</strong>' +
            '<span class="pupuk-rumus">' + (p.beli || '') + '</span></td>' +
          '<td data-label="Dibutuhkan">' + gram(g[kode]) + '</td>' +
          '<td data-label="Siapkan">' + gram(beli) + '</td>' +
        '</tr>';
    });
    if (campuran && campuran.gram > 0) {
      baris +=
        '<tr>' +
          '<td data-label="Pupuk"><strong>Campuran mikro siap pakai</strong>' +
            '<span class="pupuk-rumus">Produk mikro hidroponik apa pun, sesuaikan kadarnya di kolom sebelah</span></td>' +
          '<td data-label="Dibutuhkan">' + gram(campuran.gram) + '</td>' +
          '<td data-label="Siapkan">' + gram(bulatBeli(campuran.gram)) + '</td>' +
        '</tr>';
    }
    document.getElementById('r-tabel-belanja').innerHTML = baris ||
      '<tr><td colspan="3">Belum ada bahan yang perlu dibeli.</td></tr>';
  }

  /* Menulis daftar parameter ke sebuah <dl>. Memakai textContent, bukan
     innerHTML, jadi tidak ada teks yang bisa berubah jadi markup. */
  function tulisParam(idDl, baris) {
    var dl = el(idDl);
    if (!dl) return;
    dl.textContent = '';
    baris.forEach(function (b) {
      var div = document.createElement('div');
      div.className = 'calc-row';
      var dt = document.createElement('dt'); dt.textContent = b[0];
      var dd = document.createElement('dd'); dd.textContent = b[1];
      div.appendChild(dt); div.appendChild(dd); dl.appendChild(div);
    });
  }

  function tanggalHariIni() {
    return new Date().toLocaleDateString('id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* Kop cetak mode A. Yang dicantumkan hanya yang belum tampil di daftar
     hasil, ditambah angka kalibrasi produk supaya lembarannya bisa dipakai
     ulang tanpa membuka kalkulator lagi. */
  function isiKopCetakA() {
    var sel = el('n-tanaman');
    var nama = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
    var skala = num('n-skala') || 500;

    el('cetak-a-judul').textContent = nama;
    el('cetak-a-tanggal').textContent = tanggalHariIni();

    tulisParam('cetak-a-param', [
      ['EC sasaran', rapi(num('n-ec-target')) + ' mS/cm'],
      ['Skala TDS meter', 'skala ' + nf0.format(skala)],
      ['Kalibrasi produk', rapi(num('n-dosis-acuan')) + ' ml/L pada EC ' +
                           rapi(num('n-ec-acuan')) + ' mS/cm']
    ]);
  }

  function isiKopCetak(volume, faktor, volStok, s, skor) {
    var sel = el('r-resep');
    var namaResep = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
    var asli = cariResep(sel.value);
    var diubah = URUT_HARA.some(function (u) {
      return Math.abs(num('r-' + u) - asli.hara[u]) > 0.01;
    });

    el('cetak-judul').textContent = namaResep + (diubah ? ' (disesuaikan)' : '');
    el('cetak-tanggal').textContent = tanggalHariIni();

    /* Hanya yang belum muncul di daftar hasil, supaya tidak mengulang. */
    tulisParam('cetak-param', [
      ['Faktor kepekatan', faktor + 'x'],
      ['Konsentrasi resep', nf0.format(s.persen * 100) + ' persen']
    ]);
  }

  function gambarRacikan(g, dapat, dapatMikro, s, volume, faktor, volStok, campuran, catatan) {
    var mlPerLiter = faktor > 0 ? 1000 / faktor : 0;

    el('r-out-dosis').textContent = rapi(mlPerLiter) + ' ml/L';
    el('r-out-stok').textContent = rapi(volStok) + ' L per tangki';
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
          .map(function (u) { return u + ' ' + rapi(campuran.pct[u]) + '%'; }).join(' &middot; ');
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
      var fmt = { format: function (x) { return x >= 10 ? nf0.format(x) : rapi(x); } };
      cek +=
        '<tr' + (kelasBaris ? ' class="' + kelasBaris + '"' : '') + '>' +
          '<td data-label="Unsur"><strong>' + u + '</strong>' +
            '<span class="pupuk-rumus">' + NAMA_UNSUR[u] + '</span></td>' +
          '<td data-label="Sasaran">' + fmt.format(target) + '</td>' +
          '<td data-label="Hasil">' + fmt.format(hasil) + '</td>' +
          '<td data-label="Selisih"><span class="delta ' + kelas + '">' +
            tanda + rapi(persen) + '%</span></td>' +
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
    el('r-out-skor').textContent = rapi(rata) + '%';
    var badge = el('r-skor-badge');
    badge.className = 'calc-badge ' + (rata >= 97 ? 'is-ok' : rata >= 90 ? '' : rata >= 75 ? 'is-warn' : 'is-danger');
    el('r-skor-teks').textContent =
      rata >= 97 ? 'Racikan sangat mendekati resep.' :
      rata >= 90 ? 'Cukup baik. Periksa unsur yang ditandai kuning.' :
      rata >= 75 ? 'Ada unsur yang meleset jauh. Sesuaikan sasaran atau sumber pupuknya.' :
                   'Resep ini sulit dicapai dengan pupuk yang dipilih. Ubah sasarannya.';

    isiBelanja(g, campuran);
    isiKopCetak(volume, faktor, volStok, s, rata);

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

  el('r-resep').addEventListener('change', muatResep);

  /* Saat mencetak, kotak hasil dipindahkan sementara ke wadah di ujung body.
     Sisa isi halaman lalu dimatikan lewat display: none, bukan sekadar
     disembunyikan, supaya dokumen tidak menyisakan halaman kosong.
     Dipasang pada beforeprint agar Ctrl+P ikut tertangani, bukan hanya tombol. */
  (function siapkanCetak() {
    var area = el('area-cetak');
    if (!area) return;

    /* Yang dicetak mengikuti tab yang sedang terbuka. Mode racik ikut
       membawa lampiran urutan meracik beserta ilustrasinya. */
    function bagianAktif() {
      var racikTerbuka = !el('panel-racik').hidden;
      var id = racikTerbuka
        ? ['cetak-wrap', 'langkah-meracik']       /* racik: cara meracik dari pupuk tunggal */
        : ['cetak-wrap-a', 'langkah-abmix'];      /* siap pakai: cara memakai pekatan jadi */
      return id.map(function (x) { return el(x); }).filter(Boolean);
    }

    var kaki = area.querySelector('.cetak-kaki');
    var dipindah = null;

    function pindahkan() {
      if (dipindah) return;
      dipindah = bagianAktif().map(function (n) {
        var jangkar = document.createComment('posisi-' + n.id);
        n.parentNode.insertBefore(jangkar, n);
        /* Disisipkan sebelum baris kaki, supaya kaki tetap paling bawah. */
        area.insertBefore(n, kaki);
        return { simpul: n, jangkar: jangkar };
      });
      document.documentElement.classList.add('sedang-cetak');
    }

    function pulihkan() {
      if (!dipindah) return;
      dipindah.forEach(function (b) {
        if (b.jangkar.parentNode) {
          b.jangkar.parentNode.insertBefore(b.simpul, b.jangkar);
          b.jangkar.parentNode.removeChild(b.jangkar);
        }
      });
      document.documentElement.classList.remove('sedang-cetak');
      dipindah = null;
    }

    window.addEventListener('beforeprint', pindahkan);
    window.addEventListener('afterprint', pulihkan);

    /* Sebagian peramban lama hanya memberi kabar lewat matchMedia. */
    if (window.matchMedia) {
      var mq = window.matchMedia('print');
      var kabar = function (e) { if (e.matches) { pindahkan(); } else { pulihkan(); } };
      if (mq.addEventListener) mq.addEventListener('change', kabar);
      else if (mq.addListener) mq.addListener(kabar);
    }

    function cetakSekarang() {
      pindahkan();
      window.print();
      pulihkan();          /* di Chrome, print() baru kembali setelah dialog ditutup */
    }

    ['n-cetak', 'r-cetak'].forEach(function (id) {
      var b = el(id);
      if (b) b.addEventListener('click', cetakSekarang);
    });
  })();

  el('r-preset').addEventListener('change', function () { terapkanPreset(this.value); });

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
        return u + ' ' + rapi(p.unsur[u]) + '%';
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
          '<td data-label="EC">' + rapi(p.ec[0]) + ' - ' + rapi(p.ec[1]) + '</td>' +
          '<td data-label="PPM (skala 500)">' + nf0.format(p.ec[0] * 500) + ' - ' + nf0.format(p.ec[1] * 500) + '</td>' +
          '<td data-label="PPM (skala 700)">' + nf0.format(p.ec[0] * 700) + ' - ' + nf0.format(p.ec[1] * 700) + '</td>' +
          '<td data-label="pH">' + rapi(p.ph[0]) + ' - ' + rapi(p.ph[1]) + '</td>' +
        '</tr>';
    });
    t.innerHTML = html;
  })();

  /* =====================================================================
     Tab
     ===================================================================== */
  var tombolTab = Array.prototype.slice.call(akar.querySelectorAll('.tab-btn'));

  /* Bagian langkah di bawah kalkulator ikut berganti bersama tabnya. Urutan
     meracik hanya berlaku untuk racikan dari pupuk tunggal, dan cara memakai
     hanya untuk pekatan jadi, jadi menampilkan keduanya sekaligus justru
     membingungkan. */
  function pilihTab(panelId) {
    tombolTab.forEach(function (x) {
      var aktif = x.dataset.panel === panelId;
      x.classList.toggle('aktif', aktif);
      x.setAttribute('aria-selected', aktif ? 'true' : 'false');
    });
    akar.querySelectorAll('.tab-panel').forEach(function (p) {
      p.hidden = (p.id !== panelId);
    });
    document.querySelectorAll('[data-untuk]').forEach(function (bagian) {
      bagian.hidden = (bagian.dataset.untuk !== panelId);
    });
  }

  tombolTab.forEach(function (b) {
    b.addEventListener('click', function () { pilihTab(b.dataset.panel); });
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
    pilihTab('panel-siap');
    var t = tanamanA('selada');
    el('n-ec-target').value = ((t.ec[0] + t.ec[1]) / 2).toFixed(1);
    hitungSiapPakai();
    isiPilihanResep('selada');
    muatResep();
  })();
})();
