import { formatCurrency } from '../shared/utils.js';

// --- DASHBOARD RENDERING ---

export function renderDashboardPage(appState) {
    const currentHour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    let greetingIcon = '🌅';

    if (currentHour >= 12 && currentHour < 15) {
        greeting = 'Selamat Siang';
        greetingIcon = '☀️';
    } else if (currentHour >= 15 && currentHour < 18) {
        greeting = 'Selamat Sore';
        greetingIcon = '🌇';
    } else if (currentHour >= 18 || currentHour < 6) {
        greeting = 'Selamat Malam';
        greetingIcon = '🌙';
    }

    return `
        <div class="mb-6">
            <!-- Welcome Message -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-4xl">${greetingIcon}</div>
                        <div>
                            <h2 class="text-2xl font-bold">${greeting}, ${appState.loggedInUser.fullName}!</h2>
                            <p class="text-indigo-100 mt-1">Selamat datang kembali di Portal Sulthan Group</p>
                        </div>
                    </div>
                    <button id="logout-btn" class="bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-5 py-2 rounded-lg hover:bg-white/30 transition duration-300">Keluar</button>
                </div>
            </div>

            <!-- Dashboard Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Dasbor Operasional Sulthan Group</h1>
                <p class="text-gray-500 mt-1">Analisis kinerja sertifikasi dan keuangan secara real-time.</p>
            </div>
        </div>
        ${renderDashboardTabs(appState)}
    `;
}

export function renderDashboardTabs(appState) {
    const tabButton = (label, tabId) => {
        const isActive = appState.dashboardTab === tabId;
        return `<button onclick="setDashboardTab('${tabId}')" class="px-3 py-2 font-semibold transition-colors duration-300 text-sm md:text-base ${isActive ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}">${label}</button>`;
    };

    let tabContent = '';
    if (appState.dashboardTab === 'ringkasan') {
        tabContent = renderRingkasanView(appState);
    } else if (appState.dashboardTab === 'analisisSertifikat') {
        tabContent = `<div class="bg-white p-6 rounded-2xl shadow-md text-center text-gray-500 mt-6">Fitur Analisis Sertifikat akan segera hadir.</div>`;
    } else if (appState.dashboardTab === 'laporanKeuangan') {
        tabContent = `<div class="bg-white p-6 rounded-2xl shadow-md text-center text-gray-500 mt-6">Fitur Laporan Keuangan akan segera hadir.</div>`;
    } else if (appState.dashboardTab === 'pencapaianMarketing') {
        tabContent = renderPencapaianMarketingView(appState);
    }

    return `
        <div class="border-b border-gray-200">
            <nav class="flex space-x-2 md:space-x-4">
                ${tabButton('Ringkasan', 'ringkasan')}
                ${tabButton('Analisis Sertifikat', 'analisisSertifikat')}
                ${tabButton('Laporan Keuangan', 'laporanKeuangan')}
                ${tabButton('Pencapaian Marketing', 'pencapaianMarketing')}
            </nav>
        </div>
        <div id="dashboard-tab-content" class="mt-6 space-y-6">
            ${tabContent}
        </div>
    `;
}

export function getFilteredData(appState) {
    const { userSubmissions, transactions, feeP3SMData } = appState;
    const { type, month, year } = appState.dashboardFilter;
    const now = new Date();

    if (type === 'all') {
        return { filteredSubmissions: userSubmissions, filteredTransactions: transactions, filteredFeeP3SM: feeP3SMData };
    }

    let startDate, endDate;

    if (type === 'range') {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 1);
    } else {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        if (type === 'last3') startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        if (type === 'last6') startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        if (type === 'last12') startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    }

    const filteredSubmissions = userSubmissions.filter(s => {
        if (!s.inputDate) return false;
        const subDate = new Date(s.inputDate);
        return subDate >= startDate && subDate < endDate;
    });

    const filteredTransactions = transactions.filter(t => {
        if (!t.transactionDate) return false;
        const transDate = new Date(t.transactionDate);
        return transDate >= startDate && transDate < endDate;
    });

    const filteredFeeP3SM = feeP3SMData.filter(f => {
        if (!f.month || !f.year) return false;
        const feeDate = new Date(f.year, f.month - 1, 1);
        return feeDate >= startDate && feeDate < endDate;
    });

    return { filteredSubmissions, filteredTransactions, filteredFeeP3SM };
}

function renderRingkasanView(appState) {
    const { filteredSubmissions, filteredTransactions, filteredFeeP3SM } = getFilteredData(appState);
    const isUserView = appState.loggedInUser.role !== 'Super admin';

    const userSubmissions = isUserView ? filteredSubmissions.filter(s => s.submittedById === appState.loggedInUser.id) : filteredSubmissions;
    const userTransactions = isUserView ? filteredTransactions.filter(t => t.submittedById === appState.loggedInUser.id) : filteredTransactions;

    const feeP3SM = filteredFeeP3SM.reduce((acc, fee) => acc + (fee.cost || 0), 0);

    const totalKeuntungan = userSubmissions.reduce((acc, sub) => acc + (sub.keuntungan || 0), 0) + feeP3SM;
    const totalPemasukan = userSubmissions.reduce((acc, sub) => acc + (sub.biayaSetorKantor || 0), 0);
    const totalSertifikat = userSubmissions.length;
    const totalPengeluaran = userTransactions
        .filter(t => t.transactionType === 'Keluar')
        .reduce((acc, t) => acc + (t.cost || 0), 0);

    const statCard = (title, value, icon, colorClass) => `
        <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div>
                <p class="text-sm font-medium text-gray-500">${title}</p>
                <p class="text-lg font-bold text-gray-800 mt-1">${value}</p>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center ${colorClass}">
                ${icon}
            </div>
        </div>
    `;

    return `
        <div>
            <h2 class="text-xl font-semibold text-gray-800">Ringkasan Kinerja Utama</h2>
            <p class="text-gray-500 mt-1">Gunakan filter di bawah untuk melihat data pada periode tertentu.</p>
        </div>

        <div class="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap items-center gap-4">
            <div class="flex-grow sm:flex-grow-0">
                <label for="filter-month" class="text-sm font-medium text-gray-700 mr-2">Bulan:</label>
                <select id="filter-month" class="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                    <!-- Options will be populated by JS -->
                </select>
            </div>
            <div class="flex-grow sm:flex-grow-0">
                <label for="filter-year" class="text-sm font-medium text-gray-700 mr-2">Tahun:</label>
                <input type="number" id="filter-year" class="w-24 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <button data-filter="last3" class="filter-btn px-3 py-2 text-sm font-semibold rounded-lg">3 Bulan</button>
                <button data-filter="last6" class="filter-btn px-3 py-2 text-sm font-semibold rounded-lg">6 Bulan</button>
                <button data-filter="last12" class="filter-btn px-3 py-2 text-sm font-semibold rounded-lg">1 Tahun</button>
                <button data-filter="all" class="filter-btn px-3 py-2 text-sm font-semibold rounded-lg">Semua</button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            ${statCard('Total Keuntungan', formatCurrency(totalKeuntungan), '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-800" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004 0V7.151c.22.071.412.164.567.267C13.863 7.84 14 8.252 14 8.684V14.5A2.5 2.5 0 0111.5 17h-3A2.5 2.5 0 016 14.5V8.684c0-.432.137-.844.433-1.266zM4 6h12v2.5a2.5 2.5 0 01-2.5 2.5H6.5A2.5 2.5 0 014 8.5V6z" /></svg>', 'bg-green-100')}
            ${statCard('Total Pemasukan', formatCurrency(totalPemasukan), '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-800" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>', 'bg-indigo-100')}
            ${statCard('Fee P3SM', formatCurrency(feeP3SM), '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-800" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>', 'bg-purple-100')}
            ${statCard('Total Sertifikat', totalSertifikat, '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-800" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>', 'bg-yellow-100')}
            ${statCard('Total Pengeluaran', formatCurrency(totalPengeluaran), '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-800" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>', 'bg-red-100')}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div class="lg:col-span-2" id="line-chart-container">
                <!-- Line chart will be rendered here -->
            </div>
            <div class="lg:col-span-1" id="donut-chart-container">
                <!-- Donut chart will be rendered here -->
            </div>
        </div>
    `;
}

function renderPencapaianMarketingView(appState) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!appState.marketingFilter) {
        appState.marketingFilter = {
            filterType: 'month',
            month: currentMonth,
            semester: currentMonth <= 6 ? 1 : 2,
            year: currentYear
        };
    }

    const rankingData = getMarketingRankingData(appState);

    const getTitle = () => {
        const { filterType, month, semester, year } = appState.marketingFilter;
        const monthNames = ['', 'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

        if (filterType === 'month') return `RANKING BERKAS ${monthNames[month]} ${year}`;
        if (filterType === 'semester') return `RANKING BERKAS ${semester === 1 ? 'JANUARI - JUNI' : 'JULI - DESEMBER'} ${year}`;
        return `RANKING BERKAS TAHUN ${year}`;
    };

    const getSubtitle = () => {
        const { filterType, semester } = appState.marketingFilter;
        if (filterType === 'semester') return `SEMESTER ${semester === 1 ? 'I' : 'II'} - Ranking berdasarkan sertifikat marketing`;
        return 'Ranking berdasarkan sertifikat marketing';
    };

    return `
        <div class="bg-white p-6 rounded-2xl shadow-md">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">🏆 ${getTitle()}</h2>
                    <p class="text-gray-600">${getSubtitle()}</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3">
                    <select id="marketing-filter-type" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="month" ${appState.marketingFilter.filterType === 'month' ? 'selected' : ''}>Per Bulan</option>
                        <option value="semester" ${appState.marketingFilter.filterType === 'semester' ? 'selected' : ''}>Per Semester</option>
                        <option value="year" ${appState.marketingFilter.filterType === 'year' ? 'selected' : ''}>Per Tahun</option>
                    </select>

                    ${appState.marketingFilter.filterType === 'month' ? `
                        <select id="marketing-month-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === appState.marketingFilter.month ? 'selected' : ''}>${new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>`).join('')}
                        </select>
                    ` : ''}

                    ${appState.marketingFilter.filterType === 'semester' ? `
                        <select id="marketing-semester-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="1" ${appState.marketingFilter.semester === 1 ? 'selected' : ''}>Semester I (Jan-Jun)</option>
                            <option value="2" ${appState.marketingFilter.semester === 2 ? 'selected' : ''}>Semester II (Jul-Des)</option>
                        </select>
                    ` : ''}

                    <select id="marketing-year-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        ${Array.from({length: 5}, (_, i) => `<option value="${currentYear - 2 + i}" ${currentYear - 2 + i === appState.marketingFilter.year ? 'selected' : ''}>${currentYear - 2 + i}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                ${renderMarketingRankingTable(rankingData, appState)}
            </div>
        </div>
    `;
}

function getMarketingRankingData(appState) {
    const { filterType, month, semester, year } = appState.marketingFilter;
    const currentMonth = new Date().getMonth() + 1;

    const filteredSubmissions = appState.userSubmissions.filter(sub => {
        if (!sub.inputDate) return false;
        const subDate = new Date(sub.inputDate);
        const subYear = subDate.getFullYear();
        const subMonth = subDate.getMonth() + 1;

        if (subYear !== year) return false;

        if (filterType === 'month') return subMonth === month;
        if (filterType === 'semester') return semester === 1 ? (subMonth >= 1 && subMonth <= 6) : (subMonth >= 7 && subMonth <= 12);
        return true;
    });

    const marketingStats = {};
    filteredSubmissions.forEach(sub => {
        const marketingName = sub.marketingName;
        const subMonth = new Date(sub.inputDate).getMonth() + 1;

        if (!marketingStats[marketingName]) {
            marketingStats[marketingName] = { name: marketingName, column1: 0, column2: 0, total: 0 };
        }

        if (subMonth >= 1 && subMonth <= 6) marketingStats[marketingName].column1++;
        else if (subMonth >= 7 && subMonth <= 12) marketingStats[marketingName].column2++;

        marketingStats[marketingName].total++;
    });

    return Object.values(marketingStats)
        .sort((a, b) => b.total - a.total)
        .map((item, index) => ({
            ...item,
            rank: index + 1,
            winnerBulan: index === 0 ? 'Champion' : (index === 1 ? '1st runner up' : (index === 2 ? '2nd runner up' : ''))
        }));
}

function renderMarketingRankingTable(data, appState) {
    const { filterType, semester, month } = appState.marketingFilter;
    const monthNames = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

    let column1Header = 'JAN - JUNI';
    let column2Header = 'JULI - DES';
    let showColumn2 = true;

    if (filterType === 'month') {
        column1Header = monthNames[month];
        showColumn2 = false;
    } else if (filterType === 'semester') {
        column1Header = semester === 1 ? 'JAN - JUN' : 'JUL - DES';
        showColumn2 = false;
    }

    const totalColumn1 = data.reduce((sum, item) => sum + item.column1, 0);
    const totalColumn2 = data.reduce((sum, item) => sum + item.column2, 0);
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

    return `
        <table class="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <thead class="bg-blue-600 text-white">
                <tr>
                    <th class="px-4 py-3 text-center font-bold border-r border-blue-500">RANK</th>
                    <th class="px-6 py-3 text-left font-bold border-r border-blue-500">NAMA</th>
                    <th class="px-4 py-3 text-center font-bold border-r border-blue-500 bg-gradient-to-r from-cyan-500 to-blue-500">${column1Header}</th>
                    ${showColumn2 ? `<th class="px-4 py-3 text-center font-bold border-r border-blue-500 bg-gradient-to-r from-orange-500 to-pink-500">${column2Header}</th>` : ''}
                    <th class="px-6 py-3 text-center font-bold border-r border-blue-500">WINNER BULAN</th>
                    <th class="px-4 py-3 text-center font-bold">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((item, index) => `
                    <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors">
                        <td class="px-4 py-3 text-center font-bold text-lg border-r border-gray-300">${item.rank}</td>
                        <td class="px-6 py-3 font-semibold text-gray-800 border-r border-gray-300">${item.name}</td>
                        <td class="px-4 py-3 text-center font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 border-r border-gray-300 shadow-lg">${item.column1}</td>
                        ${showColumn2 ? `<td class="px-4 py-3 text-center font-bold text-white bg-gradient-to-r from-orange-400 to-pink-500 border-r border-gray-300 shadow-lg">${item.column2}</td>` : ''}
                        <td class="px-6 py-3 text-center font-semibold border-r border-gray-300">
                            ${item.winnerBulan ? `<span class="px-3 py-1 rounded-full text-sm font-bold ${
                                item.winnerBulan === 'Champion' ? 'bg-yellow-400 text-yellow-900' :
                                item.winnerBulan === '1st runner up' ? 'bg-gray-300 text-gray-800' :
                                'bg-orange-300 text-orange-900'
                            }">${item.winnerBulan}</span>` : ''}
                        </td>
                        <td class="px-4 py-3 text-center font-bold text-lg">${item.total}</td>
                    </tr>
                `).join('')}
                <tr class="bg-blue-100 font-bold border-t-2 border-blue-600">
                    <td class="px-4 py-3 text-center border-r border-gray-300"></td>
                    <td class="px-6 py-3 text-right border-r border-gray-300">TOTAL:</td>
                    <td class="px-4 py-3 text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 border-r border-gray-300 shadow-lg">${totalColumn1}</td>
                    ${showColumn2 ? `<td class="px-4 py-3 text-center text-white bg-gradient-to-r from-orange-600 to-pink-600 border-r border-gray-300 shadow-lg">${totalColumn2}</td>` : ''}
                    <td class="px-6 py-3 text-center border-r border-gray-300"></td>
                    <td class="px-4 py-3 text-center text-lg">${grandTotal}</td>
                </tr>
            </tbody>
        </table>
    `;
}

export function renderLineChart(container, submissions, appState) {
    const monthlyProfits = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);
    submissions.forEach(sub => {
        if (sub.inputDate) {
            const subDate = new Date(sub.inputDate);
            if (subDate.getFullYear() === appState.dashboardFilter.year) {
                const month = subDate.getMonth();
                monthlyProfits[month] += sub.keuntungan || 0;
                monthlyCounts[month] += 1;
            }
        }
    });

    const maxProfit = Math.max(...monthlyProfits, 1);
    const highestLabel = Math.ceil(maxProfit / 100000) * 100000 || 100000;
    const yLabels = Array.from({length: 6}, (_, i) => Math.round(highestLabel / 5 * i));

    const points = monthlyProfits.map((profit, index) => {
        const x = (index / 11) * 100;
        const y = 100 - (profit / highestLabel) * 100;
        return { x, y, profit, count: monthlyCounts[index], month: new Date(2025, index).toLocaleString('id-ID', { month: 'short' }) };
    });

    const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    const areaPathData = `${pathData} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    container.innerHTML = `
        <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm h-full">
            <h3 class="font-semibold text-gray-800">Tren Keuntungan Bulanan</h3>
            <p class="text-sm text-gray-500 mb-4">Visualisasi keuntungan yang dihasilkan setiap bulan dalam periode terpilih.</p>
            <div class="relative w-full h-72">
                <svg id="line-chart-svg" class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="line-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(99, 102, 241, 0.3)" />
                            <stop offset="100%" stop-color="rgba(99, 102, 241, 0)" />
                        </linearGradient>
                    </defs>
                    ${yLabels.map((label, i) => `
                        <line x1="0" y1="${100 - (i * 20)}" x2="100" y2="${100 - (i * 20)}" stroke="#e5e7eb" stroke-width="0.5" />
                        <text x="-1" y="${100 - (i * 20)}" dy="0.3em" text-anchor="end" font-size="3" fill="#6b7280">${formatCurrency(label).replace(/\s*Rp\s*/, 'Rp ')}</text>
                    `).join('')}
                    ${points.map((p, i) => `<text x="${p.x}" y="105" text-anchor="middle" font-size="3" fill="#6b7280">${p.month}</text>`).join('')}
                    <path d="${areaPathData}" fill="url(#line-chart-gradient)" />
                    <path d="${pathData}" stroke="#6366f1" stroke-width="1" fill="none" vector-effect="non-scaling-stroke" />
                    ${points.map((p, i) => `<circle class="chart-point" cx="${p.x}" cy="${p.y}" r="1.5" fill="#6366f1" data-month="${p.month}" data-profit="${p.profit}" data-count="${p.count}" />`).join('')}
                </svg>
            </div>
        </div>
    `;

    const svg = container.querySelector('#line-chart-svg');
    const tooltip = document.getElementById('chart-tooltip');
    svg.querySelectorAll('.chart-point').forEach(point => {
        point.addEventListener('mouseenter', (e) => {
            const month = e.target.dataset.month;
            const profit = formatCurrency(Number(e.target.dataset.profit));
            const count = e.target.dataset.count;
            tooltip.innerHTML = `<div class="font-bold">${month}</div><div>Keuntungan: ${profit}</div><div>Total Sertifikat: ${count}</div>`;
            tooltip.style.display = 'block';
        });
        point.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        point.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY}px`;
        });
    });
}

export function renderDonutChart(container, submissions) {
    const marketingData = submissions.reduce((acc, sub) => {
        if(sub.marketingName) {
            acc[sub.marketingName] = (acc[sub.marketingName] || 0) + 1;
        }
        return acc;
    }, {});
    const total = Object.values(marketingData).reduce((a, b) => a + b, 0);
    const marketingEntries = Object.entries(marketingData);

    let cumulativePercent = 0;
    const segments = marketingEntries.map(([name, count], index) => {
        const percent = total > 0 ? (count / total) * 100 : 0;
        const color = ['#4338ca', '#16a34a', '#f97316'][index % 3];
        const segment = `<circle class="donut-segment" cx="21" cy="21" r="15.9155" fill="transparent" stroke="${color}" stroke-width="5" stroke-dasharray="${percent} ${100 - percent}" stroke-dashoffset="-${cumulativePercent}" data-name="${name}" data-count="${count}"></circle>`;
        cumulativePercent += percent;
        return { segment, name, color };
    });

    container.innerHTML = `
        <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm h-full">
            <h3 class="font-semibold text-gray-800">Kinerja Marketing</h3>
            <p class="text-sm text-gray-500 mb-4">Distribusi sertifikat berdasarkan marketing pada periode terpilih.</p>
            <div class="flex flex-col sm:flex-row items-center justify-around gap-4 mt-8">
                <div class="w-32 h-32 relative">
                    <svg id="donut-chart-svg" width="100%" height="100%" viewBox="0 0 42 42" class="transform -rotate-90">
                        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e5e7eb" stroke-width="5"></circle>
                        ${segments.map(s => s.segment).join('')}
                    </svg>
                </div>
                <div class="space-y-2">
                    ${segments.length > 0 ? segments.map(s => `
                        <div class="flex items-center text-sm">
                            <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${s.color};"></span>
                            <span class="text-gray-600">${s.name}</span>
                        </div>
                    `).join('') : '<p class="text-sm text-gray-400">Belum ada data</p>'}
                </div>
            </div>
        </div>
    `;

    const tooltip = document.getElementById('donut-chart-tooltip');
    container.querySelectorAll('.donut-segment').forEach(segment => {
        segment.addEventListener('mouseenter', (e) => {
            const name = e.target.dataset.name;
            const count = e.target.dataset.count;
            tooltip.innerHTML = `<strong>${name}</strong>: ${count} sertifikat`;
            tooltip.style.display = 'block';
        });
        segment.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        segment.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY}px`;
        });
    });
}

export function attachDashboardEventListeners(appState, renderApp) {
    const { filteredSubmissions } = getFilteredData(appState);
    const userSubmissions = appState.loggedInUser.role === 'Super admin' ? filteredSubmissions : filteredSubmissions.filter(s => s.submittedById === appState.loggedInUser.id);

    const lineChartContainer = document.getElementById('line-chart-container');
    if (lineChartContainer) {
        renderLineChart(lineChartContainer, userSubmissions, appState);
    }
    const donutChartContainer = document.getElementById('donut-chart-container');
    if (donutChartContainer) {
        renderDonutChart(donutChartContainer, userSubmissions);
    }

    const monthSelect = document.getElementById('filter-month');
    const yearInput = document.getElementById('filter-year');
    const filterButtons = document.querySelectorAll('.filter-btn');

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (monthSelect) {
        monthSelect.innerHTML = months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
        monthSelect.value = appState.dashboardFilter.month;
    }

    if (yearInput) {
        yearInput.value = appState.dashboardFilter.year;
    }

    const updateUI = () => {
        renderApp();
    };

    const updateButtonStyles = () => {
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === appState.dashboardFilter.type) {
                btn.classList.add('bg-indigo-600', 'text-white');
                btn.classList.remove('bg-gray-100', 'text-gray-600');
            } else {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-600');
            }
        });
    };
    updateButtonStyles();

    monthSelect?.addEventListener('change', () => {
        appState.dashboardFilter.type = 'range';
        appState.dashboardFilter.month = parseInt(monthSelect.value);
        updateUI();
    });

    yearInput?.addEventListener('input', () => {
        appState.dashboardFilter.type = 'range';
        appState.dashboardFilter.year = parseInt(yearInput.value) || new Date().getFullYear();
        updateUI();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            appState.dashboardFilter.type = btn.dataset.filter;
            updateUI();
        });
    });

    const marketingFilterType = document.getElementById('marketing-filter-type');
    const marketingMonthFilter = document.getElementById('marketing-month-filter');
    const marketingSemesterFilter = document.getElementById('marketing-semester-filter');
    const marketingYearFilter = document.getElementById('marketing-year-filter');

    if (marketingFilterType) {
        marketingFilterType.addEventListener('change', () => {
            appState.marketingFilter.filterType = marketingFilterType.value;
            updateUI();
        });
    }

    if (marketingMonthFilter) {
        marketingMonthFilter.addEventListener('change', () => {
            appState.marketingFilter.month = parseInt(marketingMonthFilter.value);
            updateUI();
        });
    }

    if (marketingSemesterFilter) {
        marketingSemesterFilter.addEventListener('change', () => {
            appState.marketingFilter.semester = parseInt(marketingSemesterFilter.value);
            updateUI();
        });
    }

    if (marketingYearFilter) {
        marketingYearFilter.addEventListener('change', () => {
            appState.marketingFilter.year = parseInt(marketingYearFilter.value);
            updateUI();
        });
    }
}
