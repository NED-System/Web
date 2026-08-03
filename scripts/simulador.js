/**
 * Simulador Financiero Plan de Puntos - NED
 * Soporte Dual:
 * - Método 3: La Prueba de la Servilleta (Express 3 Pasos - Recomendado Negocios Tradicionales)
 * - Método 2: Asistente Financiero (5 Pasos + Semáforo)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Estado general
    const state = {
        activeTab: 'metodo3', // 'metodo3' por defecto

        // ==========================================
        // ESTADO MÉTODO 3 (Express 3 Pasos - La Servilleta)
        // ==========================================
        m3: {
            currentStep: 1,
            totalSteps: 3,
            rewardName: 'Una Hamburguesa Clásica',
            rewardCost: 6000,
            businessType: 'comidas', // 'barberia' | 'comidas' | 'tienda'
            pointsRequired: 50,
            valuePerPoint: 1000, // $1.000 COP por defecto
            targetCustomers: 25 // Default 25 clientes/mes
        },

        // ==========================================
        // ESTADO MÉTODO 2 (5 Pasos + Semáforo)
        // ==========================================
        m2: {
            currentStep: 1,
            totalSteps: 5,
            rewardName: 'Hamburguesa Clásica',
            rewardCost: 14500,
            category: 'product',
            pointsRequired: 150,
            pointsPerCurrencyUnit: 1000,
            expirationMonths: 12,
            grossMarginPct: 60,
            estimatedCustomers: 500,
            redemptionRatePct: 60,
            avgRevenuePerCustomer: 150000,
            incentiveAttributionPct: 15,
            sensitivityClaimPct: 60
        }
    };

    // Formatters
    const formatCurrency = (val) => {
        const amount = Math.round(val || 0);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (val) => {
        return new Intl.NumberFormat('es-CO').format(Math.round(val || 0));
    };

    // Helper genérico para actualizar texto de elemento por ID
    function setElText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // ==========================================================================
    // LÓGICA Y CÁLCULOS MÉTODO 3 ("LA PRUEBA DE LA SERVILLETA")
    // ==========================================================================
    function calculateM3Metrics() {
        const requiredSpend = state.m3.pointsRequired * state.m3.valuePerPoint;
        const costPerPoint = state.m3.pointsRequired > 0 ? (state.m3.rewardCost / state.m3.pointsRequired) : 0;
        const rewardPct = requiredSpend > 0 ? ((state.m3.rewardCost / requiredSpend) * 100) : 0;

        const monthlySales = state.m3.targetCustomers * requiredSpend;
        const monthlyInvestment = state.m3.targetCustomers * state.m3.rewardCost;

        let maxThreshold = 11; // Default Costo insumo medio (10-12%)
        let bTypeName = 'Negocio costo insumo medio (Ej: Comidas Rápidas)';

        if (state.m3.businessType === 'barberia') {
            maxThreshold = 18; // Costo insumo bajo (15-20%)
            bTypeName = 'Negocio costo insumo bajo (Ej: Barberías/Servicios)';
        } else if (state.m3.businessType === 'tienda') {
            maxThreshold = 4.5; // Margen muy estrecho (3-5%)
            bTypeName = 'Negocio margen muy estrecho (Ej: Tiendas de Barrio)';
        }

        let isViable = rewardPct <= maxThreshold;
        let alertStatusClass = isViable ? 'servilleta-green' : 'servilleta-red';
        let alertTitle = isViable ? '🟢 ¡EXCELENTE NEGOCIO!' : '🔴 ⚠️ OJO CON LA RENTABILIDAD';

        let alertMessage = '';
        if (isViable) {
            alertMessage = `Estás entregando solo el ${rewardPct.toFixed(1)}% del valor de la venta en el premio. Para tu tipo de negocio (${bTypeName}), tu margen soporta perfectamente la estrategia.`;
        } else {
            const minPointsNeeded = Math.ceil(state.m3.rewardCost / (state.m3.valuePerPoint * (maxThreshold / 100)));
            const maxRewardCostAllowed = requiredSpend * (maxThreshold / 100);

            alertMessage = `Este premio te cuesta mucho (${rewardPct.toFixed(1)}% de la venta) para los puntos que estás pidiendo en tu negocio (${bTypeName}). Sube los puntos requeridos a por lo menos ${minPointsNeeded} puntos o elige un premio que te cueste menos de ${formatCurrency(maxRewardCostAllowed)} para no perder dinero.`;
        }

        return {
            requiredSpend,
            costPerPoint,
            rewardPct,
            monthlySales,
            monthlyInvestment,
            isViable,
            alertStatusClass,
            alertTitle,
            alertMessage,
            bTypeName
        };
    }

    function updateM3UI() {
        const m = calculateM3Metrics();

        const progressBar = document.getElementById('m3-progress-bar');
        const stepCounter = document.getElementById('m3-step-counter');
        if (progressBar) progressBar.style.width = `${Math.round((state.m3.currentStep / state.m3.totalSteps) * 100)}%`;
        if (stepCounter) stepCounter.textContent = `Paso ${state.m3.currentStep} de ${state.m3.totalSteps}`;

        for (let i = 1; i <= state.m3.totalSteps; i++) {
            const stepEl = document.getElementById(`m3-step-card-${i}`);
            if (stepEl) {
                stepEl.style.display = (i === state.m3.currentStep) ? 'block' : 'none';
            }
        }

        const resultEl = document.getElementById('m3-servilleta-results');
        if (resultEl) resultEl.style.display = (state.m3.currentStep === state.m3.totalSteps) ? 'block' : 'none';

        setElText('m3-calc-spend-required', formatCurrency(m.requiredSpend));
        setElText('m3-calc-cost-per-point', formatCurrency(m.costPerPoint));

        setElText('servilleta-required-spend', formatCurrency(m.requiredSpend));
        setElText('servilleta-reward-cost', formatCurrency(state.m3.rewardCost));
        setElText('servilleta-spend-explanation', formatCurrency(m.requiredSpend));
        setElText('servilleta-cost-explanation', formatCurrency(state.m3.rewardCost));

        setElText('servilleta-customers-count', formatNumber(state.m3.targetCustomers));
        setElText('servilleta-monthly-sales', formatCurrency(m.monthlySales));
        setElText('servilleta-monthly-investment', formatCurrency(m.monthlyInvestment));

        const alertBox = document.getElementById('servilleta-alert-box');
        if (alertBox) {
            alertBox.className = `servilleta-alert-box ${m.alertStatusClass}`;
        }
        setElText('servilleta-alert-title', m.alertTitle);
        setElText('servilleta-alert-message', m.alertMessage);

        const btnM3Next = document.getElementById('btn-m3-next');
        if (btnM3Next) {
            if (state.m3.currentStep === state.m3.totalSteps) {
                btnM3Next.innerHTML = 'Ver Mi Servilleta &rarr;';
            } else {
                btnM3Next.innerHTML = 'Siguiente &rarr;';
            }
        }
    }

    // ==========================================================================
    // CÁLCULOS Y LÓGICA MÉTODO 2 (5 Pasos + Semáforo)
    // ==========================================================================
    function calculateM2Metrics(overrideRedemptionRate = null) {
        const redemptionPct = overrideRedemptionRate !== null ? overrideRedemptionRate : state.m2.redemptionRatePct;
        const spendRequiredToRedeem = state.m2.pointsRequired * state.m2.pointsPerCurrencyUnit;
        const costPerPoint = state.m2.pointsRequired > 0 ? (state.m2.rewardCost / state.m2.pointsRequired) : 0;
        const programCostPercentOfSale = spendRequiredToRedeem > 0 ? ((state.m2.rewardCost / spendRequiredToRedeem) * 100) : 0;
        const marginGivenAway = state.m2.grossMarginPct > 0 ? ((programCostPercentOfSale / state.m2.grossMarginPct) * 100) : 0;
        const claimingCustomers = Math.round(state.m2.estimatedCustomers * (redemptionPct / 100));
        const totalProjectedProgramCost = claimingCustomers * state.m2.rewardCost;
        
        const effectiveAvgRevenue = (state.m2.hasCustomAvgRevenue && state.m2.avgRevenuePerCustomer > 0)
            ? state.m2.avgRevenuePerCustomer
            : (spendRequiredToRedeem > 0 ? spendRequiredToRedeem : 150000);

        const totalCustomerRevenue = state.m2.estimatedCustomers * effectiveAvgRevenue;
        const incrementalRevenueProjected = totalCustomerRevenue * (state.m2.incentiveAttributionPct / 100);
        const unredeemedRate = 1 - (redemptionPct / 100);
        const outstandingPointsLiability = state.m2.estimatedCustomers * state.m2.pointsRequired * costPerPoint * unredeemedRate;
        const roi = totalProjectedProgramCost > 0 ? (((incrementalRevenueProjected - totalProjectedProgramCost) / totalProjectedProgramCost) * 100) : 0;

        let viabilityStatus = 'green';
        let viabilityTitle = '🟢 Programa Financieramente Viable';
        let viabilityBadgeClass = 'status-green';
        let viabilityDesc = 'El ROI incremental es positivo y el costo del programa absorbe menos del 20% de tu margen bruto. ¡Es una propuesta excelente!';

        if (roi < 0 || marginGivenAway > 40) {
            viabilityStatus = 'red';
            viabilityTitle = '🔴 Programa No Viable (Alto Riesgo)';
            viabilityBadgeClass = 'status-red';
            viabilityDesc = 'El costo del premio absorbe más del 40% de tu margen o genera pérdidas netas. Sube los puntos requeridos.';
        } else if (marginGivenAway >= 20 || roi < 50) {
            viabilityStatus = 'yellow';
            viabilityTitle = '🟡 Programa con Riesgo Moderado';
            viabilityBadgeClass = 'status-yellow';
            viabilityDesc = 'El programa genera ganancias pero el premio consume entre el 20% y 40% de tu margen bruto.';
        }

        return {
            spendRequiredToRedeem, costPerPoint, programCostPercentOfSale,
            marginGivenAway, claimingCustomers, totalProjectedProgramCost,
            effectiveAvgRevenue, incrementalRevenueProjected, outstandingPointsLiability, roi,
            viabilityStatus, viabilityTitle, viabilityBadgeClass, viabilityDesc, redemptionPct
        };
    }

    function updateM2UI() {
        const m = calculateM2Metrics();
        const progressBar = document.getElementById('m2-progress-bar');
        const stepCounter = document.getElementById('m2-step-counter');
        if (progressBar) progressBar.style.width = `${Math.round((state.m2.currentStep / state.m2.totalSteps) * 100)}%`;
        if (stepCounter) stepCounter.textContent = `Paso ${state.m2.currentStep} de ${state.m2.totalSteps}`;

        for (let i = 1; i <= state.m2.totalSteps; i++) {
            const stepEl = document.getElementById(`m2-step-card-${i}`);
            if (stepEl) stepEl.style.display = (i === state.m2.currentStep) ? 'block' : 'none';
        }

        const avgRevInput = document.getElementById('m2-input-avg-revenue');
        if (avgRevInput) {
            if (!state.m2.hasCustomAvgRevenue) {
                avgRevInput.value = m.spendRequiredToRedeem > 0 ? m.spendRequiredToRedeem : 150000;
            }
        }
        const helpRev = document.getElementById('m2-help-avg-revenue');
        if (helpRev) {
            helpRev.textContent = `Calculado automáticamente desde la venta requerida (${formatCurrency(m.spendRequiredToRedeem)}). Puedes modificarlo si tus clientes gastan diferente.`;
        }

        const dashboardEl = document.getElementById('m2-dashboard');
        if (dashboardEl) dashboardEl.style.display = (state.m2.currentStep === state.m2.totalSteps) ? 'block' : 'none';

        setElText('m2-calc-spend-required', formatCurrency(m.spendRequiredToRedeem));
        setElText('m2-calc-cost-per-point', formatCurrency(m.costPerPoint));
        setElText('m2-calc-program-cost-pct', `${m.programCostPercentOfSale.toFixed(1)}%`);
        setElText('m2-calc-margin-given-away', `${m.marginGivenAway.toFixed(1)}%`);
        setElText('m2-calc-claiming-customers', `${formatNumber(m.claimingCustomers)} clientes`);

        const slider = document.getElementById('m2-sensitivity-slider');
        const sliderVal = document.getElementById('m2-sensitivity-val');
        if (slider && sliderVal) {
            state.m2.sensitivityClaimPct = parseFloat(slider.value) || 60;
            sliderVal.textContent = `${state.m2.sensitivityClaimPct}%`;
        }

        const sensM = calculateM2Metrics(state.m2.sensitivityClaimPct);
        setElText('m2-sens-cost', formatCurrency(sensM.totalProjectedProgramCost));
        setElText('m2-sens-revenue', formatCurrency(sensM.incrementalRevenueProjected));
        setElText('m2-sens-roi', `${sensM.roi.toFixed(0)}%`);

        const semaforoCard = document.getElementById('m2-semaforo-card');
        if (semaforoCard) semaforoCard.className = `m2-semaforo-card ${m.viabilityBadgeClass}`;
        setElText('m2-semaforo-title', m.viabilityTitle);
        setElText('m2-semaforo-desc', m.viabilityDesc);

        setElText('m2-dash-reward-name', state.m2.rewardName || 'Recompensa');
        setElText('m2-dash-reward-cost', formatCurrency(state.m2.rewardCost));
        setElText('m2-dash-spend-required', formatCurrency(m.spendRequiredToRedeem));
        setElText('m2-dash-cost-per-point', formatCurrency(m.costPerPoint));
        setElText('m2-dash-program-cost-pct', `${m.programCostPercentOfSale.toFixed(1)}%`);
        setElText('m2-dash-margin-given-away', `${m.marginGivenAway.toFixed(1)}%`);
        setElText('m2-dash-projected-cost', formatCurrency(m.totalProjectedProgramCost));
        setElText('m2-dash-incremental-revenue', formatCurrency(m.incrementalRevenueProjected));
        setElText('m2-dash-points-liability', formatCurrency(m.outstandingPointsLiability));
        setElText('m2-dash-roi', `${m.roi.toFixed(0)}%`);

        const btnM2Next = document.getElementById('btn-m2-next');
        if (btnM2Next) {
            if (state.m2.currentStep === state.m2.totalSteps) {
                btnM2Next.innerHTML = 'Ver Resultados &rarr;';
            } else {
                btnM2Next.innerHTML = 'Siguiente &rarr;';
            }
        }
    }

    // ==========================================================================
    // CAMBIO DE PESTAÑAS (DUAL: MÉTODO 3 Y MÉTODO 2)
    // ==========================================================================
    function setupTabs() {
        const tabBtnM3 = document.getElementById('tab-btn-metodo3');
        const tabBtnM2 = document.getElementById('tab-btn-metodo2');

        const containerM3 = document.getElementById('simulador-metodo3-container');
        const containerM2 = document.getElementById('simulador-metodo2-container');

        if (tabBtnM3 && tabBtnM2 && containerM3 && containerM2) {
            tabBtnM3.addEventListener('click', () => {
                state.activeTab = 'metodo3';
                tabBtnM3.classList.add('active');
                tabBtnM2.classList.remove('active');

                containerM3.style.display = 'block';
                containerM2.style.display = 'none';
                updateM3UI();
            });

            tabBtnM2.addEventListener('click', () => {
                state.activeTab = 'metodo2';
                tabBtnM2.classList.add('active');
                tabBtnM3.classList.remove('active');

                containerM2.style.display = 'block';
                containerM3.style.display = 'none';
                updateM2UI();
            });
        }
    }

    // ==========================================================================
    // VINCULACIÓN DE INPUTS Y EVENTOS
    // ==========================================================================
    function bindAllInputs() {
        // --- Método 3 Inputs ---
        const m3Name = document.getElementById('m3-input-reward-name');
        if (m3Name) {
            m3Name.addEventListener('input', (e) => {
                state.m3.rewardName = e.target.value.trim() !== '' ? e.target.value : 'Una Hamburguesa Clásica';
                updateM3UI();
            });
        }

        const m3Cost = document.getElementById('m3-input-reward-cost');
        if (m3Cost) {
            m3Cost.addEventListener('input', (e) => {
                state.m3.rewardCost = e.target.value.trim() !== '' ? (parseFloat(e.target.value) || 0) : 6000;
                updateM3UI();
            });
        }

        const m3Pts = document.getElementById('m3-input-points-required');
        if (m3Pts) {
            m3Pts.addEventListener('input', (e) => {
                state.m3.pointsRequired = e.target.value.trim() !== '' ? (parseFloat(e.target.value) || 0) : 50;
                updateM3UI();
            });
        }

        const m3ValuePt = document.getElementById('m3-input-value-per-point');
        if (m3ValuePt) {
            m3ValuePt.addEventListener('input', (e) => {
                state.m3.valuePerPoint = e.target.value.trim() !== '' ? (parseFloat(e.target.value) || 1000) : 1000;
                updateM3UI();
            });
        }

        const m3CustManual = document.getElementById('m3-input-target-customers');
        if (m3CustManual) {
            m3CustManual.addEventListener('input', (e) => {
                state.m3.targetCustomers = e.target.value.trim() !== '' ? (parseFloat(e.target.value) || 0) : 25;
                updateM3UI();
            });
        }

        const bTypeBtns = document.querySelectorAll('[data-m3-btype]');
        bTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                state.m3.businessType = btn.dataset.m3Btype;
                bTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateM3UI();
            });
        });

        const custPresetBtns = document.querySelectorAll('[data-m3-preset-customers]');
        custPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const count = parseFloat(btn.dataset.m3PresetCustomers);
                state.m3.targetCustomers = count;
                if (m3CustManual) m3CustManual.value = count;
                custPresetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateM3UI();
            });
        });

        // --- Método 2 Inputs ---
        const m2Inputs = [
            'm2-input-reward-name',
            'm2-input-reward-cost',
            'm2-input-points-required',
            'm2-input-points-per-unit',
            'm2-input-expiration-months',
            'm2-input-gross-margin',
            'm2-input-estimated-customers',
            'm2-input-redemption-rate',
            'm2-input-avg-revenue',
            'm2-input-attribution-pct'
        ];

        m2Inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('focus', function () {
                    this.select();
                });
            }
        });

        const m2Defaults = {
            rewardName: 'Hamburguesa Clásica',
            rewardCost: 14500,
            pointsRequired: 150,
            pointsPerCurrencyUnit: 1000,
            expirationMonths: 12,
            grossMarginPct: 60,
            estimatedCustomers: 500,
            redemptionRatePct: 60,
            avgRevenuePerCustomer: 150000,
            incentiveAttributionPct: 15,
            sensitivityClaimPct: 60
        };

        const m2Map = [
            { id: 'm2-input-reward-name', key: 'rewardName', type: 'string' },
            { id: 'm2-input-reward-cost', key: 'rewardCost', type: 'number' },
            { id: 'm2-input-category', key: 'category', type: 'string' },
            { id: 'm2-input-points-required', key: 'pointsRequired', type: 'number' },
            { id: 'm2-input-points-per-unit', key: 'pointsPerCurrencyUnit', type: 'number' },
            { id: 'm2-input-expiration-months', key: 'expirationMonths', type: 'number' },
            { id: 'm2-input-gross-margin', key: 'grossMarginPct', type: 'number' },
            { id: 'm2-input-estimated-customers', key: 'estimatedCustomers', type: 'number' },
            { id: 'm2-input-redemption-rate', key: 'redemptionRatePct', type: 'number' },
            { id: 'm2-input-avg-revenue', key: 'avgRevenuePerCustomer', type: 'number' },
            { id: 'm2-input-attribution-pct', key: 'incentiveAttributionPct', type: 'number' },
            { id: 'm2-sensitivity-slider', key: 'sensitivityClaimPct', type: 'number' }
        ];

        m2Map.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                el.addEventListener('input', (e) => {
                    const rawVal = e.target.value.trim();
                    if (item.id === 'm2-input-avg-revenue') {
                        if (rawVal !== '') {
                            state.m2.hasCustomAvgRevenue = true;
                            state.m2.avgRevenuePerCustomer = parseFloat(rawVal) || 0;
                        } else {
                            state.m2.hasCustomAvgRevenue = false;
                            state.m2.avgRevenuePerCustomer = 0;
                        }
                    } else if (item.type === 'number') {
                        state.m2[item.key] = rawVal !== '' ? (parseFloat(rawVal) || 0) : (m2Defaults[item.key] || 0);
                    } else {
                        state.m2[item.key] = rawVal !== '' ? rawVal : (m2Defaults[item.key] || '');
                    }
                    updateM2UI();
                });
            }
        });
    }

    // Navegación de Wizards
    function setupWizardNavigations() {
        // --- Navigation Método 3 ---
        const btnM3Next = document.getElementById('btn-m3-next');
        const btnM3Prev = document.getElementById('btn-m3-prev');

        if (btnM3Next) {
            btnM3Next.addEventListener('click', () => {
                if (state.m3.currentStep < state.m3.totalSteps) {
                    state.m3.currentStep++;
                    updateM3UI();
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                } else if (state.m3.currentStep === state.m3.totalSteps) {
                    const resultsEl = document.getElementById('m3-servilleta-results');
                    if (resultsEl) {
                        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }
        if (btnM3Prev) {
            btnM3Prev.addEventListener('click', () => {
                if (state.m3.currentStep > 1) {
                    state.m3.currentStep--;
                    updateM3UI();
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                }
            });
        }

        // --- Navigation Método 2 ---
        const btnM2Next = document.getElementById('btn-m2-next');
        const btnM2Prev = document.getElementById('btn-m2-prev');

        if (btnM2Next) {
            btnM2Next.addEventListener('click', () => {
                if (state.m2.currentStep < state.m2.totalSteps) {
                    state.m2.currentStep++;
                    updateM2UI();
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                } else if (state.m2.currentStep === state.m2.totalSteps) {
                    const dashboardEl = document.getElementById('m2-dashboard');
                    if (dashboardEl) {
                        dashboardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }
        if (btnM2Prev) {
            btnM2Prev.addEventListener('click', () => {
                if (state.m2.currentStep > 1) {
                    state.m2.currentStep--;
                    updateM2UI();
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                }
            });
        }

        // Botón CTA Activar Premio M3
        const btnActivateM3 = document.getElementById('btn-m3-activate-app');
        if (btnActivateM3) {
            btnActivateM3.addEventListener('click', () => {
                alert(`🚀 ¡Excelente! El premio "${state.m3.rewardName}" (${state.m3.pointsRequired} pts) ha sido configurado exitosamente. Puedes activarlo directamente en tu Web App de NED.`);
            });
        }

        // Reiniciar M3
        const btnResetM3 = document.getElementById('btn-m3-reset');
        if (btnResetM3) {
            btnResetM3.addEventListener('click', () => {
                state.m3.currentStep = 1;
                updateM3UI();
                window.scrollTo({ top: 180, behavior: 'smooth' });
            });
        }

        // Imprimir y Reiniciar M2
        const btnPrintM2 = document.getElementById('btn-m2-print');
        if (btnPrintM2) btnPrintM2.addEventListener('click', () => window.print());

        const btnResetM2 = document.getElementById('btn-m2-reset');
        if (btnResetM2) {
            btnResetM2.addEventListener('click', () => {
                state.m2.currentStep = 1;
                updateM2UI();
                window.scrollTo({ top: 180, behavior: 'smooth' });
            });
        }
    }

    // Inicializar
    setupTabs();
    bindAllInputs();
    setupWizardNavigations();
    updateM3UI();
    updateM2UI();
});
