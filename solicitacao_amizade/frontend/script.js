document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userListEl = document.getElementById('userList');
    const receivedRequestsListEl = document.getElementById('receivedRequestsList');
    const logoutButton = document.getElementById('logoutButton');
    const currentUserSpan = document.getElementById('currentUser');
    const viewUsersButton = document.getElementById('viewUsersButton');
    const viewRequestsButton = document.getElementById('viewRequestsButton');
    const usersSection = document.getElementById('usersSection');
    const requestsSection = document.getElementById('requestsSection');
    const requestCountSpan = document.getElementById('requestCount');
    const viewFriendsButton = document.getElementById('viewFriendsButton');
    const friendsSection = document.getElementById('friendsSection');
    const friendsListEl = document.getElementById('friendsList');
    const friendsCountSpan = document.getElementById('friendsCount');

    const API_URL = 'http://localhost:3000';

    // --- Funções Auxiliares ---
    function getToken() { return localStorage.getItem('token'); }
    function getUsername() { return localStorage.getItem('username'); }

    function showSection(sectionId) {
        [usersSection, requestsSection, friendsSection].forEach(section => {
            if (section) section.style.display = 'none';
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) activeSection.style.display = 'block';
    }

    async function makeApiRequest(endpoint, method = 'GET', body = null) {
        console.log(`[FRONTEND] Iniciando requisição: ${method} para ${API_URL}${endpoint}`);
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) { // Log body only for relevant methods
            console.log('[FRONTEND] Corpo da requisição (antes de stringify):', body);
        }

        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            // console.log('[FRONTEND] Token JWT adicionado ao cabeçalho.'); // Log menos verboso
        }

        const config = { method, headers };
        // Adiciona corpo apenas se body existir e o método for apropriado
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            console.log(`[FRONTEND] Resposta recebida para ${method} ${endpoint}. Status: ${response.status}`);
            const responseText = await response.text();
            // console.log(`[FRONTEND] Texto bruto da resposta para ${method} ${endpoint}:`, responseText); // Log menos verboso

            if (response.status === 401) {
                console.error('[FRONTEND] Erro 401 (Não Autorizado). Fazendo logout.');
                alert('Sua sessão é inválida ou expirou. Por favor, faça login novamente.');
                handleLogout();
                throw new Error('Não Autorizado');
            }

            let responseData = null;
            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                    // console.log(`[FRONTEND] Dados da resposta (JSON parseado) para ${method} ${endpoint}:`, responseData); // Log menos verboso
                } catch (e) {
                    console.warn(`[FRONTEND] Resposta para ${method} ${endpoint} não é um JSON válido. Usando texto bruto se o status for OK. Erro de parse: ${e.message}`);
                    if (response.ok) {
                        responseData = responseText || null;
                    }
                }
            }

            if (!response.ok) {
                const errorMessage = responseData?.message || responseText || `Erro HTTP: ${response.status}`;
                console.error(`[FRONTEND] Erro na requisição API para ${method} ${endpoint}: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error(`[FRONTEND] Erro pego no bloco CATCH para ${method} ${API_URL}${endpoint}:`, error.message);
            throw error;
        }
    }


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            console.log(`[FRONTEND] Tentativa de registro para usuário: ${username}`);

            if (!username || !password) {
                alert('Usuário e senha são obrigatórios.');
                console.warn('[FRONTEND] Registro: Usuário ou senha em branco.');
                return;
            }
            if (password.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                console.warn('[FRONTEND] Registro: Senha curta.');
                return;
            }

            try {
                const data = await makeApiRequest('/register', 'POST', { username, password });
                console.log('[FRONTEND] Resposta da API de registro:', data);
                alert(data.message || 'Usuário aparentemente registrado! Faça o login.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('[FRONTEND] Erro no processo de registro (interface):', error.message);
                alert(`Erro no registro: ${error.message}`);
            }
        });
    }


    if (loginForm) {
        const loginSubmitButton = document.getElementById('loginSubmitButton');
        const loginSuccessStateDiv = document.getElementById('loginSuccessState');
        const goToDashboardButton = document.getElementById('goToDashboardButton');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginSubmitButton) loginSubmitButton.disabled = true;

            const username = e.target.username.value;
            const password = e.target.password.value;

            if (!username || !password) {
                alert('Usuário e senha são obrigatórios.');
                if (loginSubmitButton) loginSubmitButton.disabled = false;
                return;
            }

            try {
                const data = await makeApiRequest('/login', 'POST', { username, password });

                if (data && data.token && data.userId && data.username) { // Adicionado check para data não ser null
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId); // Supondo que o backend retorna userId também
                    localStorage.setItem('username', data.username);

                    const loginFormElement = document.getElementById('loginForm');

                    if (loginFormElement) {
                        loginFormElement.style.display = 'none'; // Esconde o formulário de login inteiro

                        const authFormContainer = loginFormElement.parentElement;
                        if (authFormContainer) {
                            const siblingParagraphs = authFormContainer.querySelectorAll('p');
                            siblingParagraphs.forEach(p => {
                                const hasRegisterLink = p.querySelector('a[href="register.html"]');
                                const hasIndexLink = p.querySelector('a[href="index.html"]');
                                if (hasRegisterLink || hasIndexLink) {
                                    p.style.display = 'none';
                                }
                            });
                        }
                    }

                    if (loginSuccessStateDiv) {
                        loginSuccessStateDiv.style.display = 'block';
                    }

                    if (goToDashboardButton) {
                        goToDashboardButton.addEventListener('click', () => {
                            window.location.href = 'dashboard.html';
                        });
                    }
                } else {
                    alert(data?.message || 'Falha no login. Verifique suas credenciais ou a resposta do servidor.');
                    if (loginSubmitButton) loginSubmitButton.disabled = false;
                }
            } catch (error) {
                console.error('[FRONTEND] Erro no processo de login (interface):', error.message);
                alert(`Erro no login: ${error.message}`);
                if (loginSubmitButton) loginSubmitButton.disabled = false;
            }
        });
    }


    function handleLogout() {
        console.log('[FRONTEND] Executando logout.');
        const token = getToken();
        if (token) {
            makeApiRequest('/logout', 'POST').catch(err => console.warn("[FRONTEND] Logout no servidor falhou ou não implementado:", err.message));
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }

    if (window.location.pathname.endsWith('dashboard.html')) {
        console.log('[FRONTEND] Carregando dashboard.html');
        if (!getToken()) {
            console.log('[FRONTEND] Sem token no dashboard, redirecionando para login.');
            window.location.href = 'login.html';
            return; // Importante adicionar return para não executar o resto do código
        }

        const username = getUsername();

        if (currentUserSpan && username) {
            currentUserSpan.textContent = username;
        } else if (currentUserSpan) {
            currentUserSpan.textContent = "Usuário"; // Fallback
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        if (viewUsersButton) {
            viewUsersButton.addEventListener('click', () => {
                if (usersSection) showSection('usersSection');
                loadUsers();
            });
        }
        if (viewRequestsButton) {
            viewRequestsButton.addEventListener('click', () => {
                if (requestsSection) showSection('requestsSection');
                loadReceivedFriendRequests();
            });
        }
        if (viewFriendsButton) {
            viewFriendsButton.addEventListener('click', () => {
                if (friendsSection) showSection('friendsSection');
                loadFriends();
                updateFriendsCount(); // Call the function here to update the friends count
            });
        }

        // Carregar inicialmente a lista de usuários e contagem de solicitações
        if (usersSection) { // Verifica se a seção de usuários existe antes de tentar mostrá-la
            showSection('usersSection');
            loadUsers();
        } else { // Se não houver seção de usuários, talvez carregar as solicitações ou nada por padrão
            loadUsers(); // Tenta carregar usuários de qualquer forma, se userListEl existir
        }
        updateReceivedRequestsCount();
    }

    async function loadUsers() {
        console.log('[FRONTEND] Chamando loadUsers().');
        if (!userListEl) {
            console.warn('[FRONTEND] Elemento userListEl não encontrado para carregar usuários.');
            return;
        }
        userListEl.innerHTML = '<li>Carregando usuários...</li>';
        try {
            // Requisição para /users DEVE ser GET. makeApiRequest defaulta para GET.
            const users = await makeApiRequest('/users');
            console.log('[FRONTEND] Usuários recebidos:', users);
            userListEl.innerHTML = '';
            if (!users || users.length === 0) {
                userListEl.innerHTML = '<li>Nenhum outro usuário encontrado para interagir.</li>';
                return;
            }
            const currentUserIdStr = localStorage.getItem('userId'); // Pega o ID do usuário logado

            users.forEach(user => {
                // Não exibir o próprio usuário na lista para enviar solicitação
                if (currentUserIdStr && user.id === parseInt(currentUserIdStr)) {
                    return;
                }

                const li = document.createElement('li');
                li.textContent = user.username;

                const sendBtn = document.createElement('button');
                sendBtn.textContent = 'Enviar Solicitação';
                sendBtn.classList.add('send-request-btn');
                sendBtn.dataset.userId = user.id;
                sendBtn.onclick = async () => {
                    try {
                        console.log(`[FRONTEND] Enviando solicitação para usuário ID: ${user.id}`);
                        const data = await makeApiRequest('/friend-request', 'POST', { toUserId: user.id });
                        alert(data.message || 'Solicitação enviada.');
                        sendBtn.textContent = 'Solicitação Enviada';
                        sendBtn.disabled = true;
                    } catch (error) {
                        console.error(`[FRONTEND] Erro ao enviar solicitação de amizade: ${error.message}`);
                        alert(`Erro ao enviar solicitação: ${error.message}`);
                    }
                };
                li.appendChild(sendBtn);
                userListEl.appendChild(li);
            });
        } catch (error) {
            console.error(`[FRONTEND] Erro ao carregar usuários: ${error.message}`);
            userListEl.innerHTML = `<li>Erro ao carregar usuários: ${error.message}. Tente recarregar.</li>`;
        }
    }

    async function loadReceivedFriendRequests() {
        console.log('[FRONTEND] Chamando loadReceivedFriendRequests().');
        if (!receivedRequestsListEl) {
            console.warn('[FRONTEND] Elemento receivedRequestsListEl não encontrado.');
            return;
        }
        receivedRequestsListEl.innerHTML = '<li>Carregando solicitações...</li>';
        try {
            const requests = await makeApiRequest('/friend-requests/received'); // Default é GET
            console.log('[FRONTEND] Solicitações recebidas:', requests);
            receivedRequestsListEl.innerHTML = '';
            if (!requests || requests.length === 0) {
                receivedRequestsListEl.innerHTML = '<li>Nenhuma solicitação de amizade recebida.</li>';
                if (requestCountSpan) requestCountSpan.textContent = '0';
                return;
            }
            if (requestCountSpan) requestCountSpan.textContent = requests.length.toString();

            requests.forEach(req => {
                const li = document.createElement('li');
                li.innerHTML = `<span>De: <strong>${req.from_username}</strong></span>`; // Assumindo que o backend envia from_username

                const btnDiv = document.createElement('div');
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Aceitar';
                acceptBtn.classList.add('accept-request-btn');
                acceptBtn.onclick = () => respondToRequest(req.id, 'aceita');

                const rejectBtn = document.createElement('button');
                rejectBtn.textContent = 'Recusar';
                rejectBtn.classList.add('reject-request-btn');
                rejectBtn.onclick = () => respondToRequest(req.id, 'recusada');

                btnDiv.appendChild(acceptBtn);
                btnDiv.appendChild(rejectBtn);
                li.appendChild(btnDiv);
                receivedRequestsListEl.appendChild(li);
            });
        } catch (error) {
            console.error(`[FRONTEND] Erro ao carregar solicitações de amizade: ${error.message}`);
            receivedRequestsListEl.innerHTML = `<li>Erro ao carregar solicitações: ${error.message}</li>`;
            if (requestCountSpan) requestCountSpan.textContent = '0';
        }
    }

    async function updateReceivedRequestsCount() {
        if (!requestCountSpan) return;
        try {
            const requests = await makeApiRequest('/friend-requests/received'); // Default é GET
            requestCountSpan.textContent = (requests && Array.isArray(requests) && requests.length) ? requests.length.toString() : '0';
        } catch (error) {
            console.warn("[FRONTEND] Não foi possível atualizar a contagem de solicitações:", error.message);
            requestCountSpan.textContent = '?'; // Ou '0'
        }
    }


    async function respondToRequest(requestId, status) {
        try {
            console.log(`[FRONTEND] Respondendo à solicitação ID: ${requestId} com status: ${status}`);
            const data = await makeApiRequest('/friend-requests/respond', 'POST', { requestId, status });
            alert(data.message || `Resposta à solicitação enviada.`);
            loadReceivedFriendRequests();
            loadUsers(); // Para atualizar status de amizade na lista de usuários, se aplicável
            updateReceivedRequestsCount();
        } catch (error) {
            console.error(`[FRONTEND] Erro ao responder solicitação: ${error.message}`);
            alert(`Erro ao responder solicitação: ${error.message}`);
        }
    }

    // Em frontend/script.js (pode ser colocada perto de loadUsers ou loadReceivedFriendRequests)
    async function loadFriends() {
        console.log('[FRONTEND] Chamando loadFriends().');
        if (!friendsListEl) {
            console.warn('[FRONTEND] Elemento friendsListEl não encontrado para carregar amigos.');
            return;
        }
        friendsListEl.innerHTML = '<li>Carregando amigos...</li>';
        try {
            const friends = await makeApiRequest('/friends'); // GET para a nova rota /friends
            console.log('[FRONTEND] Amigos recebidos:', friends);
            friendsListEl.innerHTML = ''; // Limpa a lista

            if (!friends || friends.length === 0) {
                friendsListEl.innerHTML = '<li>Você ainda não fez amizades. Que tal enviar algumas solicitações?</li>';
                if (friendsCountSpan) friendsCountSpan.textContent = '0';
                return;
            }
            if (friendsCountSpan) friendsCountSpan.textContent = friends.length.toString();

            friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;
                friendsListEl.appendChild(li);
            });
        } catch (error) {
            console.error(`[FRONTEND] Erro ao carregar lista de amigos: ${error.message}`);
            friendsListEl.innerHTML = `<li>Erro ao carregar amigos: ${error.message}. Tente recarregar.</li>`;
            if (friendsCountSpan) friendsCountSpan.textContent = '0';
        }
    }

    async function updateFriendsCount() {
        if (!friendsCountSpan) return;
        try {
            const friends = await makeApiRequest('/friends'); // GET para /friends
            friendsCountSpan.textContent = (friends && Array.isArray(friends) && friends.length) ? friends.length.toString() : '0';
        } catch (error) {
            console.warn("[FRONTEND] Não foi possível atualizar a contagem de amigos:", error.message);
            friendsCountSpan.textContent = '?';
        }
    }

    // Redirecionamento para dashboard.html se já logado e tentando acessar login/register
    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
        if (getToken()) {
            const loginSuccessStateVisible = document.getElementById('loginSuccessState')?.style.display === 'block';
            if (!loginSuccessStateVisible) { // Não redireciona se a mensagem de sucesso do login já estiver visível
                console.log('[FRONTEND] Token encontrado em login/register, redirecionando para dashboard.');
                window.location.href = 'dashboard.html';
            }
        }
    }
});
