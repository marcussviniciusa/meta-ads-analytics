import api from './api';

const googleAnalyticsService = {
  /**
   * Verifica o status da conexão com o Google Analytics
   * @returns {Promise<Object>} Status da conexão
   */
  checkConnectionStatus: async () => {
    try {
      const response = await api.get('/integrations/google-analytics/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do Google Analytics:', error);
      throw error;
    }
  },

  /**
   * Obtém as propriedades do Google Analytics
   * @returns {Promise<Array>} Lista de propriedades
   */
  getProperties: async () => {
    try {
      const response = await api.get('/integrations/google-analytics/properties');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter propriedades do Google Analytics:', error);
      throw error;
    }
  },

  /**
   * Obtém relatório do Google Analytics
   * @param {string} propertyId - ID da propriedade
   * @param {Object} reportConfig - Configuração do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  getReport: async (propertyId, reportConfig) => {
    try {
      const response = await api.post('/integrations/google-analytics/report', {
        propertyId,
        reportConfig
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter relatório do Google Analytics:', error);
      throw error;
    }
  },

  /**
   * Obtém relatório simplificado para o dashboard
   * @param {string} propertyId - ID da propriedade
   * @param {string} startDate - Data inicial (yyyy-MM-dd)
   * @param {string} endDate - Data final (yyyy-MM-dd)
   * @returns {Promise<Object>} Dados do relatório
   */
  getDashboardReport: async (propertyId, startDate, endDate) => {
    try {
      const reportConfig = {
        dateRanges: [
          {
            startDate,
            endDate
          }
        ],
        dimensions: [
          {
            name: 'date'
          }
        ],
        metrics: [
          // Métricas básicas
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'engagementRate' },
          
          // Métricas de funil
          { name: 'eventCount' },        // Total de eventos
          { name: 'totalUsers' },         // Total de usuários
          
          // Eventos específicos serão capturados em um relatório separado
        ]
      };

      return await googleAnalyticsService.getReport(propertyId, reportConfig);
    } catch (error) {
      console.error('Erro ao obter relatório para o dashboard:', error);
      throw error;
    }
  },
  
  /**
   * Obtém relatório detalhado para o funil de vendas
   * @param {string} propertyId - ID da propriedade
   * @param {string} startDate - Data inicial (yyyy-MM-dd)
   * @param {string} endDate - Data final (yyyy-MM-dd)
   * @returns {Promise<Object>} Dados do relatório de funil
   */
  getFunnelReport: async (propertyId, startDate, endDate) => {
    try {
      const reportConfig = {
        dateRanges: [
          {
            startDate,
            endDate
          }
        ],
        dimensions: [
          {
            name: 'eventName'
          }
        ],
        metrics: [
          { name: 'eventCount' },
          { name: 'totalUsers' }
        ]
      };

      return await googleAnalyticsService.getReport(propertyId, reportConfig);
    } catch (error) {
      console.error('Erro ao obter relatório de funil:', error);
      throw error;
    }
  },
  
  /**
   * Obtém dados consolidados do funil de conversão
   * @param {string} propertyId - ID da propriedade
   * @param {string} startDate - Data inicial (yyyy-MM-dd)
   * @param {string} endDate - Data final (yyyy-MM-dd)
   * @returns {Promise<Object>} Dados consolidados do funil
   */
  getDetailedInsights: async (propertyId, startDate, endDate) => {
    try {
      // Obter dados básicos e dados de eventos do funil
      const [dashboardData, funnelData] = await Promise.all([
        googleAnalyticsService.getDashboardReport(propertyId, startDate, endDate),
        googleAnalyticsService.getFunnelReport(propertyId, startDate, endDate)
      ]);
      
      // Extrair eventos do funil de vendas
      const funnelEvents = {};
      if (funnelData && funnelData.rows) {
        funnelData.rows.forEach(row => {
          const eventName = row.dimensionValues[0].value;
          const eventCount = parseInt(row.metricValues[0].value, 10);
          funnelEvents[eventName] = eventCount;
        });
      }
      
      // Organizar as métricas solicitadas pelo usuário
      const detailedMetrics = {
        // Google Analytics Métricas Essenciais
        gaMetrics: {
          usuarios: dashboardData?.totals?.[0]?.metricValues?.[0]?.value || 0,
          novosUsuarios: dashboardData?.totals?.[0]?.metricValues?.[1]?.value || 0,
          usuariosAtivos: dashboardData?.totals?.[0]?.metricValues?.[0]?.value || 0,
          tempoMedioEngajamento: dashboardData?.totals?.[0]?.metricValues?.[4]?.value || 0,
          visualizacoesPagina: funnelEvents['page_view'] || 0,
          canaisOrigem: {
            organico: 0, // Estes dados precisariam vir de uma consulta específica
            direto: 0,
            referencia: 0,
            social: 0,
            cpc: 0,
            email: 0,
            outros: 0
          },
          paginasEntrada: [], // Precisaria de uma consulta específica
          paginasSaida: [], // Precisaria de uma consulta específica
          contagemEventos: dashboardData?.totals?.[0]?.metricValues?.[6]?.value || 0,
          eventosEspecificos: {
            scroll_depth: funnelEvents['scroll'] || 0,
            click: funnelEvents['click'] || 0,
            form_submit: funnelEvents['form_submit'] || 0,
            other_events: 0
          },
          adicaoCarrinho: funnelEvents['add_to_cart'] || 0,
          inicioCheckout: funnelEvents['begin_checkout'] || 0,
          comprasCompletadas: funnelEvents['purchase'] || 0
        },
        
        // Meta Ads Métricas Essenciais
        metaAdsMetrics: {
          impressoes: 0, // Dados simulados (na implementação real viriam da API do Meta Ads)
          alcance: 0,
          cliquesTodos: 0,
          cliquesLink: 0,
          ctr: 0,
          reacoesPost: 0,
          thruPlays: 0,
          visualizacoesPaginaDestino: 0,
          conversoes: 0,
          taxaConversao: 0,
          leads: 0,
          cpc: 0,
          cpm: 0,
          custoPorResultado: 0,
          custoPorVisualizacaoVideo: 0,
          custoPorConversao: 0
        },
        
        // Dados Organizados por Funnel (conforme implementação anterior)
        capturePageMetrics: {
          totalAccesses: funnelEvents['page_view'] || 0,
          totalFormsFilled: funnelEvents['form_submit'] || 0,
          conversionRate: 0 // Calculado abaixo
        },
        salesPageMetrics: {
          totalAccesses: funnelEvents['page_view_sales'] || 0,
          totalButtonClicks: funnelEvents['click'] || 0,
          totalPopupsAnswered: funnelEvents['popup_interaction'] || 0,
          conversionRate: 0 // Calculado abaixo
        },
        checkoutMetrics: {
          totalCheckoutsStarted: funnelEvents['begin_checkout'] || 0,
          totalAddToCart: funnelEvents['add_to_cart'] || 0,
          totalAwaitingPayment: funnelEvents['payment_pending'] || 0,
          conversionRate: 0 // Calculado abaixo
        },
        purchaseResults: {
          totalApproved: funnelEvents['purchase'] || 0,
          totalExpired: funnelEvents['purchase_expired'] || 0,
          totalRefund: funnelEvents['refund'] || 0,
          conversionRate: 0 // Calculado abaixo
        },
        upsellMetrics: {
          totalOB1: funnelEvents['purchase_ob1'] || 0,
          totalOB2: funnelEvents['purchase_ob2'] || 0,
          totalUpsell1: funnelEvents['purchase_upsell1'] || 0,
          totalUpsell2: funnelEvents['purchase_upsell2'] || 0
        }
      };
      
      // Calcular taxas de conversão
      if (detailedMetrics.capturePageMetrics.totalAccesses > 0) {
        detailedMetrics.capturePageMetrics.conversionRate = 
          (detailedMetrics.capturePageMetrics.totalFormsFilled / detailedMetrics.capturePageMetrics.totalAccesses) * 100;
      }
      
      if (detailedMetrics.salesPageMetrics.totalAccesses > 0) {
        detailedMetrics.salesPageMetrics.conversionRate = 
          (detailedMetrics.salesPageMetrics.totalButtonClicks / detailedMetrics.salesPageMetrics.totalAccesses) * 100;
      }
      
      if (detailedMetrics.checkoutMetrics.totalCheckoutsStarted > 0) {
        detailedMetrics.checkoutMetrics.conversionRate = 
          (detailedMetrics.checkoutMetrics.totalAwaitingPayment / detailedMetrics.checkoutMetrics.totalCheckoutsStarted) * 100;
      }
      
      if (detailedMetrics.checkoutMetrics.totalAwaitingPayment > 0) {
        detailedMetrics.purchaseResults.conversionRate = 
          (detailedMetrics.purchaseResults.totalApproved / detailedMetrics.checkoutMetrics.totalAwaitingPayment) * 100;
      }
      
      // Simular valores para métricas do Meta Ads (pois esses dados viriam de outra API)
      detailedMetrics.metaAdsMetrics = {
        impressoes: 125000,
        alcance: 45000,
        cliquesTodos: 7500,
        cliquesLink: 6200,
        ctr: 4.96,
        reacoesPost: 2800,
        thruPlays: 9500,
        visualizacoesPaginaDestino: 5800,
        conversoes: 1250,
        taxaConversao: 21.55,
        leads: 1850,
        cpc: 0.92,
        cpm: 14.25,
        custoPorResultado: 5.35,
        custoPorVisualizacaoVideo: 0.42,
        custoPorConversao: 6.15
      };
      
      // Dados adicionais para GA que seriam obtidos de consultas específicas
      detailedMetrics.gaMetrics.canaisOrigem = {
        organico: 3200,
        direto: 2100,
        referencia: 1500,
        social: 2200,
        cpc: 950,
        email: 380,
        outros: 120
      };
      
      detailedMetrics.gaMetrics.paginasEntrada = [
        { pagina: '/pagina-captura', visitas: 3500 },
        { pagina: '/blog/artigo-1', visitas: 1500 },
        { pagina: '/', visitas: 1200 }
      ];
      
      detailedMetrics.gaMetrics.paginasSaida = [
        { pagina: '/obrigado', visitas: 2400 },
        { pagina: '/pagina-captura', visitas: 950 },
        { pagina: '/checkout', visitas: 750 }
      ];
      
      return detailedMetrics;
    } catch (error) {
      console.error('Erro ao obter insights detalhados:', error);
      throw error;
    }
  }
};

export default googleAnalyticsService;
