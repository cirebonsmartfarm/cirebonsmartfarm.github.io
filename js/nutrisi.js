/* =========================================================================
   Kalkulator nutrisi hidroponik - Cirebon Smart Farm

   Dua mode:
     A. Larutan siap pakai. Menghitung takaran pekatan A dan B untuk mengisi
        tandon sampai EC sasaran, plus koreksi tandon yang sedang berjalan.
     B. Racik sendiri. Menghitung gram tiap pupuk tunggal dari sasaran unsur
        hara, dipisah ke Tangki A dan Tangki B supaya kalsium tidak bertemu
        sulfat dan fosfat di dalam pekatan.

   Semua hitungan berjalan di peramban pengunjung. Tidak ada data yang dikirim.
   ========================================================================= */
(function () {
  'use strict';

  var akar = document.getElementById('kalkulator-nutrisi');
  if (!akar) return;

  /* ---------------------------------------------------------------------
     Data tanaman.
     ec  : rentang EC kerja dalam mS/cm
     ph  : rentang pH yang dianjurkan
     hara: sasaran unsur hara dalam ppm (mg per liter larutan kerja)
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

  /* Sasaran hara mikro, ppm larutan kerja. Berlaku umum untuk semua tanaman. */
  var MIKRO = { Fe: 3.0, Mn: 0.5, Zn: 0.25, B: 0.5, Cu: 0.05, Mo: 0.05 };

  /* ---------------------------------------------------------------------
     Pupuk tunggal yang lazim dijual di Indonesia.
     Persentase memakai angka pada label dagang, bukan kemurnian teoretis,
     karena itu yang tertera di karung yang Anda beli.
     tangki: 'A' untuk yang mengandung kalsium, 'B' untuk sulfat dan fosfat.
     --------------------------------------------------------------------- */
  var PUPUK = {
    kalnit:  { nama: 'Kalsium Nitrat', rumus: '5Ca(NO3)2 &middot; NH4NO3 &middot; 10H2O',
               label: '15,5% N &middot; 26,5% CaO', unsur: { N: 15.5, Ca: 19.0 }, tangki: 'A' },
    kno3:    { nama: 'Kalium Nitrat (KNO3)', rumus: 'KNO3',
               label: '13% N &middot; 46% K2O', unsur: { N: 13.0, K: 38.2 }, tangki: 'A' },
    mkp:     { nama: 'MKP', rumus: 'KH2PO4',
               label: '52% P2O5 &middot; 34% K2O', unsur: { P: 22.7, K: 28.2 }, tangki: 'B' },
    mgso4:   { nama: 'Magnesium Sulfat (garam Inggris)', rumus: 'MgSO4 &middot; 7H2O',
               label: '16% MgO &middot; 13% S', unsur: { Mg: 9.8, S: 13.0 }, tangki: 'B' },
    k2so4:   { nama: 'Kalium Sulfat (ZK)', rumus: 'K2SO4',
               label: '50% K2O &middot; 17,5% S', unsur: { K: 41.5, S: 17.5 }, tangki: 'B' },
    za:      { nama: 'Amonium Sulfat (ZA)', rumus: '(NH4)2SO4',
               label: '21% N &middot; 24% S', unsur: { N: 21.0, S: 24.0 }, tangki: 'B' },
    feedta:  { nama: 'Fe-EDTA 13%', rumus: 'C10H12FeN2NaO8',
               label: '13% Fe', unsur: { Fe: 13.0 }, tangki: 'A' },
    mnso4:   { nama: 'Mangan Sulfat', rumus: 'MnSO4 &middot; H2O',
               label: '32,5% Mn', unsur: { Mn: 32.5 }, tangki: 'B' },
    znso4:   { nama: 'Seng Sulfat', rumus: 'ZnSO4 &middot; 7H2O',
               label: '22,7% Zn', unsur: { Zn: 22.7 }, tangki: 'B' },
    cuso4:   { nama: 'Tembaga Sulfat', rumus: 'CuSO4 &middot; 5H2O',
               label: '25,5% Cu', unsur: { Cu: 25.5 }, tangki: 'B' },
    borax:   { nama: 'Borax', rumus: 'Na2B4O7 &middot; 10H2O',
               label: '11,3% B', unsur: { B: 11.3 }, tangki: 'B' },
    namo:    { nama: 'Natrium Molibdat', rumus: 'Na2MoO4 &middot; 2H2O',
               label: '39,7% Mo', unsur: { Mo: 39.7 }, tangki: 'B' }
  };

  var URUT_HARA = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
  var URUT_MIKRO = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  /* ---------------------------------------------------------------------
     Bantuan format
     --------------------------------------------------------------------- */
  var nf1 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nf3 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  var nf0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

  function el(id) { return document.getElementById(id); }
  function num(id) {
    var v = parseFloat(el(id).value);
    return isFinite(v) && v >= 0 ? v : 0;
  }
  function tanaman(id) {
    for (var i = 0; i < TANAMAN.length; i++) if (TANAMAN[i].id === id) return TANAMAN[i];
    return TANAMAN[1];
  }
  /* Gram kecil lebih enak dibaca dalam miligram. */
  function gram(g) {
    if (g <= 0) return '0 g';
    if (g < 1) return nf0.format(g * 1000) + ' mg';
    if (g < 10) return nf2.format(g) + ' g';
    return nf1.format(g) + ' g';
  }

  /* =====================================================================
     Isi daftar tanaman ke kedua mode
     ===================================================================== */
  ['n-tanaman', 'r-tanaman'].forEach(function (idSel) {
    var sel = el(idSel);
    TANAMAN.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.id;
      o.textContent = t.nama;
      sel.appendChild(o);
    });
    sel.value = 'selada';
  });

  /* =====================================================================
     MODE A - larutan siap pakai
     ===================================================================== */
  function hitungSiapPakai() {
    var t = tanaman(el('n-tanaman').value);
    var volume = num('n-volume');
    var skala = num('n-skala') || 500;

    /* Dosis acuan produk: berapa ml per liter, dan EC yang dihasilkannya. */
    var dosisAcuan = num('n-dosis-acuan');
    var ecAcuan = num('n-ec-acuan');

    var ecTarget = num('n-ec-target');

    /* Rasio pengenceran linear terhadap dosis acuan. */
    var mlPerLiter = (ecAcuan > 0 && dosisAcuan > 0) ? (ecTarget / ecAcuan) * dosisAcuan : 0;
    var totalA = mlPerLiter * volume;
    var totalB = totalA;

    el('n-target-info').textContent =
      'Rentang EC ' + nf1.format(t.ec[0]) + ' - ' + nf1.format(t.ec[1]) + ' mS/cm, ' +
      'pH ' + nf1.format(t.ph[0]) + ' - ' + nf1.format(t.ph[1]);

    el('n-out-ml').textContent = nf2.format(mlPerLiter) + ' ml/L';
    el('n-out-a').textContent = totalA >= 1000
      ? nf2.format(totalA / 1000) + ' liter' : nf0.format(totalA) + ' ml';
    el('n-out-b').textContent = totalB >= 1000
      ? nf2.format(totalB / 1000) + ' liter' : nf0.format(totalB) + ' ml';
    el('n-out-ppm').textContent = nf0.format(ecTarget * skala) + ' ppm';
    el('n-out-ph').textContent = nf1.format(t.ph[0]) + ' - ' + nf1.format(t.ph[1]);
    el('n-out-volume').textContent = nf0.format(volume) + ' liter';

    /* Peringatan kalau EC di luar rentang tanaman. */
    var kotak = el('n-status');
    var pesan, kelas;
    if (ecTarget <= 0) {
      pesan = 'Isi EC sasaran lebih dulu.'; kelas = '';
    } else if (ecTarget < t.ec[0] * 0.9) {
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
    kotak.className = 'calc-badge ' + kelas;

    hitungKoreksi(mlPerLiter, ecAcuan, dosisAcuan);
  }

  /* Koreksi tandon berjalan: menaikkan EC tanpa menguras. */
  function hitungKoreksi(mlPerLiter, ecAcuan, dosisAcuan) {
    var volume = num('n-k-volume');
    var ecSekarang = num('n-k-ec');
    var ecMau = num('n-ec-target');
    var beda = ecMau - ecSekarang;

    var baris = el('n-koreksi-hasil');
    if (volume <= 0 || ecSekarang <= 0) {
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
      /* Menurunkan EC hanya bisa dengan menambah air tawar. */
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

  /* Isi kolom sasaran hara mengikuti tanaman terpilih. */
  function isiSasaran() {
    var t = tanaman(el('r-tanaman').value);
    URUT_HARA.forEach(function (u) {
      el('r-' + u).value = t.hara[u];
    });
    el('r-target-info').textContent =
      'EC kerja ' + nf1.format(t.ec[0]) + ' - ' + nf1.format(t.ec[1]) + ' mS/cm, ' +
      'pH ' + nf1.format(t.ph[0]) + ' - ' + nf1.format(t.ph[1]);
    hitungRacikan();
  }

  function hitungRacikan() {
    var faktor = num('r-faktor') || 100;       // kepekatan stok, misal 100x
    var volStok = num('r-vol-stok');           // liter per tangki pekatan
    var pakaiZA = el('r-pakai-za').checked;

    /* Satu tangki stok sebanyak volStok liter, diencerkan faktor kali, menghasilkan
       sekian liter larutan kerja. Itulah dasar semua takaran di bawah. */
    var volume = volStok * faktor;
    if (volume <= 0) return;

    var sasaran = {};
    URUT_HARA.forEach(function (u) { sasaran[u] = num('r-' + u); });

    /* Massa dihitung dalam miligram unsur untuk seluruh larutan kerja. */
    var mgTarget = {};
    URUT_HARA.forEach(function (u) { mgTarget[u] = sasaran[u] * volume; });

    var g = {};   // gram tiap pupuk untuk seluruh larutan kerja
    var catatan = [];

    /* 1. Kalsium ditentukan lebih dulu, hanya kalsium nitrat sumbernya. */
    g.kalnit = mgTarget.Ca / (PUPUK.kalnit.unsur.Ca * 10);
    var nDariKalnit = g.kalnit * PUPUK.kalnit.unsur.N * 10;

    /* 2. Fosfor seluruhnya dari MKP. */
    g.mkp = mgTarget.P / (PUPUK.mkp.unsur.P * 10);
    var kDariMkp = g.mkp * PUPUK.mkp.unsur.K * 10;

    /* 3. Magnesium dari garam Inggris. */
    g.mgso4 = mgTarget.Mg / (PUPUK.mgso4.unsur.Mg * 10);

    /* 4. Sisa nitrogen ditutup KNO3, yang sekaligus menyumbang kalium. */
    var nSisa = mgTarget.N - nDariKalnit;
    if (nSisa < 0) {
      catatan.push('Kalsium nitrat saja sudah melebihi sasaran nitrogen. ' +
                   'Turunkan sasaran Ca atau naikkan sasaran N.');
      nSisa = 0;
    }
    g.kno3 = nSisa / (PUPUK.kno3.unsur.N * 10);
    var kDariKno3 = g.kno3 * PUPUK.kno3.unsur.K * 10;

    /* 5. Kalium disetarakan. Kelebihan berarti KNO3 harus dipangkas. */
    var kSisa = mgTarget.K - kDariMkp - kDariKno3;
    g.k2so4 = 0;
    g.za = 0;

    if (kSisa >= 0) {
      g.k2so4 = kSisa / (PUPUK.k2so4.unsur.K * 10);
    } else {
      var kBoleh = mgTarget.K - kDariMkp;
      if (kBoleh < 0) {
        catatan.push('MKP saja sudah melebihi sasaran kalium. Turunkan sasaran P atau naikkan sasaran K.');
        kBoleh = 0;
      }
      g.kno3 = kBoleh / (PUPUK.kno3.unsur.K * 10);
      var nDariKno3Baru = g.kno3 * PUPUK.kno3.unsur.N * 10;
      var nKurang = mgTarget.N - nDariKalnit - nDariKno3Baru;
      if (nKurang > 0) {
        if (pakaiZA) {
          g.za = nKurang / (PUPUK.za.unsur.N * 10);
        } else {
          catatan.push('Nitrogen kurang ' + nf0.format(nKurang / volume) +
                       ' ppm karena kalium sudah penuh. Centang ZA untuk menutupnya, ' +
                       'atau turunkan sasaran K.');
        }
      }
    }

    /* Batas amonium. Terlalu banyak NH4 memicu busuk ujung daun dan menekan Ca. */
    var nTotal = nDariKalnit + g.kno3 * PUPUK.kno3.unsur.N * 10 + g.za * PUPUK.za.unsur.N * 10;
    var nAmonium = g.kalnit * 1.1 * 10 + g.za * PUPUK.za.unsur.N * 10;
    var persenAmonium = nTotal > 0 ? (nAmonium / nTotal) * 100 : 0;
    if (persenAmonium > 15) {
      catatan.push('Nitrogen bentuk amonium mencapai ' + nf0.format(persenAmonium) +
                   ' persen dari total N. Di atas 15 persen berisiko memicu busuk ujung daun. ' +
                   'Kurangi ZA.');
    }

    /* 6. Hara mikro langsung dari sasarannya. */
    var mikroG = {
      feedta: (MIKRO.Fe * volume) / (PUPUK.feedta.unsur.Fe * 10),
      mnso4:  (MIKRO.Mn * volume) / (PUPUK.mnso4.unsur.Mn * 10),
      znso4:  (MIKRO.Zn * volume) / (PUPUK.znso4.unsur.Zn * 10),
      cuso4:  (MIKRO.Cu * volume) / (PUPUK.cuso4.unsur.Cu * 10),
      borax:  (MIKRO.B  * volume) / (PUPUK.borax.unsur.B * 10),
      namo:   (MIKRO.Mo * volume) / (PUPUK.namo.unsur.Mo * 10)
    };
    Object.keys(mikroG).forEach(function (k) { g[k] = mikroG[k]; });

    /* Hasil nyata tiap unsur, untuk dibandingkan dengan sasaran. */
    var dapat = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0 };
    Object.keys(g).forEach(function (kode) {
      var p = PUPUK[kode];
      if (!p || !g[kode]) return;
      Object.keys(p.unsur).forEach(function (u) {
        if (dapat[u] === undefined) return;
        dapat[u] += (g[kode] * p.unsur[u] * 10) / volume;   // kembali ke ppm
      });
    });

    gambarRacikan(g, dapat, sasaran, volume, faktor, volStok, catatan);
  }

  function gambarRacikan(g, dapat, sasaran, volume, faktor, volStok, catatan) {
    /* Dosis pakai: berapa ml pekatan per liter air. */
    var mlPerLiter = faktor > 0 ? 1000 / faktor : 0;

    el('r-out-dosis').textContent = nf1.format(mlPerLiter) + ' ml/L';
    el('r-out-stok').textContent = nf0.format(volStok) + ' liter per tangki';
    el('r-out-cukup').textContent = nf0.format(volStok * faktor) + ' liter larutan kerja';

    /* Tabel takaran, dipisah per tangki. */
    function tabel(tangki) {
      var baris = '';
      var total = 0;
      Object.keys(PUPUK).forEach(function (kode) {
        var p = PUPUK[kode];
        if (p.tangki !== tangki || !g[kode] || g[kode] <= 0) return;
        /* Massa untuk seluruh larutan kerja, dipadatkan ke volume stok. */
        var untukStok = g[kode] * (volStok * faktor) / volume;
        total += untukStok;
        baris +=
          '<tr>' +
            '<td data-label="Pupuk"><strong>' + p.nama + '</strong>' +
              '<span class="pupuk-rumus">' + p.rumus + ' &middot; ' + p.label + '</span></td>' +
            '<td data-label="Untuk stok">' + gram(untukStok) + '</td>' +
            '<td data-label="Per 1000 L kerja">' + gram(g[kode] * 1000 / volume) + '</td>' +
          '</tr>';
      });
      if (!baris) {
        baris = '<tr><td colspan="3" data-label="Catatan">Tidak ada pupuk yang masuk tangki ini.</td></tr>';
      }
      return { baris: baris, total: total };
    }

    var A = tabel('A');
    var B = tabel('B');
    el('r-tabel-a').innerHTML = A.baris;
    el('r-tabel-b').innerHTML = B.baris;
    el('r-total-a').textContent = gram(A.total);
    el('r-total-b').textContent = gram(B.total);

    /* Sasaran dibanding hasil. Ini yang membedakan alat serius dari tebakan. */
    var cek = '';
    URUT_HARA.forEach(function (u) {
      var s = sasaran[u], d = dapat[u] || 0;
      var beda = d - s;
      var persen = s > 0 ? (beda / s) * 100 : 0;
      /* Belerang hampir selalu berlebih karena terbawa MgSO4 dan K2SO4. Itu tidak
         merugikan tanaman, jadi kelebihan S ditandai wajar, bukan merah. */
      var kelas;
      if (u === 'S' && persen > 0) {
        kelas = persen <= 120 ? 'pas' : 'dekat';
      } else {
        kelas = Math.abs(persen) <= 5 ? 'pas' : (Math.abs(persen) <= 15 ? 'dekat' : 'jauh');
      }
      var tanda = beda >= 0 ? '+' : '';
      cek +=
        '<tr>' +
          '<td data-label="Unsur"><strong>' + u + '</strong></td>' +
          '<td data-label="Sasaran">' + nf0.format(s) + ' ppm</td>' +
          '<td data-label="Hasil">' + nf0.format(d) + ' ppm</td>' +
          '<td data-label="Selisih"><span class="delta ' + kelas + '">' +
            tanda + nf1.format(persen) + '%</span></td>' +
        '</tr>';
    });
    URUT_MIKRO.forEach(function (u) {
      cek +=
        '<tr class="mikro">' +
          '<td data-label="Unsur"><strong>' + u + '</strong></td>' +
          '<td data-label="Sasaran">' + nf2.format(MIKRO[u]) + ' ppm</td>' +
          '<td data-label="Hasil">' + nf2.format(MIKRO[u]) + ' ppm</td>' +
          '<td data-label="Selisih"><span class="delta pas">tepat</span></td>' +
        '</tr>';
    });
    el('r-tabel-cek').innerHTML = cek;

    /* Catatan dan peringatan. */
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
     Tabel rujukan pupuk, digambar dari data yang sama dengan mesin hitung
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
     Pemasangan pendengar
     ===================================================================== */
  el('n-tanaman').addEventListener('change', function () {
    var t = tanaman(this.value);
    el('n-ec-target').value = nf1.format((t.ec[0] + t.ec[1]) / 2).replace(',', '.');
    hitungSiapPakai();
  });
  el('r-tanaman').addEventListener('change', isiSasaran);
  el('r-reset-hara').addEventListener('click', isiSasaran);

  akar.querySelectorAll('#panel-siap input, #panel-siap select').forEach(function (i) {
    i.addEventListener('input', hitungSiapPakai);
  });
  akar.querySelectorAll('#panel-racik input, #panel-racik select').forEach(function (i) {
    i.addEventListener('input', hitungRacikan);
  });

  /* Nilai awal supaya halaman langsung menunjukkan hasil, bukan kolom kosong. */
  (function mulai() {
    var t = tanaman('selada');
    el('n-ec-target').value = nf1.format((t.ec[0] + t.ec[1]) / 2).replace(',', '.');
    hitungSiapPakai();
    isiSasaran();
  })();
})();
