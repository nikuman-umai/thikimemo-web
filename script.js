// Firebaseプロジェクトの設定情報
// ★★★ あなたのFirebaseプロジェクト設定に置き換えてください ★★★
const firebaseConfig = {
    apiKey: "AIzaSyBMmpRvHLrXwwyKGi6IH4IH8IQkE3fjH7w",
    authDomain: "ti-kimemo.firebaseapp.com",
    projectId: "ti-kimemo",
    storageBucket: "ti-kimemo.firebasestorage.app",
    messagingSenderId: "190739467226",
    appId: "1:190739467226:web:724ac64061484b92d58ee3",
    measurementId: "G-EY72HHJD1T"
};

// Firebaseアプリの初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const dashboardLoginButton = document.querySelector('.header .login-button');
    const dashboardLogoutButton = document.getElementById('logout-button'); // ログアウトボタンを想定

    // 認証状態の監視
    auth.onAuthStateChanged(user => {
        const path = window.location.pathname;

        if (user) {
            // ログイン済みの場合
            console.log("ユーザーがログインしています:", user.email);

            // 認証ページにいる場合はダッシュボードへリダイレクト
            if (path.includes('index.html') || path.includes('register.html')) {
                window.location.href = 'dashboard.html';
            }

            // ダッシュボードにログインボタンがある場合、非表示にする
            if (dashboardLoginButton) {
                dashboardLoginButton.style.display = 'none';
            }

            // ダッシュボードにログアウトボタンがある場合、表示する
            if (dashboardLogoutButton) {
                dashboardLogoutButton.style.display = 'inline-flex';
            }

        } else {
            // 未ログインの場合
            console.log("ユーザーはログアウトしています。");

            // ログインが必要なページにいる場合はログインページへリダイレクト
            if (path.includes('dashboard.html')) {
                // ゲストモードでも閲覧可能なため、リダイレクトは行わない
                // 投稿ボタンなどの非表示/無効化は別途dashboard.jsで制御
            }

            // ダッシュボードにログインボタンがある場合、表示する
            if (dashboardLoginButton) {
                dashboardLoginButton.style.display = 'inline-flex';
            }

            // ダッシュボードにログアウトボタンがある場合、非表示にする
            if (dashboardLogoutButton) {
                dashboardLogoutButton.style.display = 'none';
            }
        }
    });

    // ログインフォームの処理 (index.html)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                alert(`ログインしました！`);
                // onAuthStateChangedによって自動的にリダイレクトされる
            } catch (error) {
                console.error("ログインエラー:", error);
                alert(`ログインに失敗しました: ${error.message}`);
            }
        });
    }

    // 新規登録フォームの処理 (register.html)
    if (registerForm) {
        const errorMessage = document.getElementById('error-message');
        const infoMessage = document.getElementById('info-message');
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            infoMessage.style.display = 'none';

            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            const agreeToTerms = registerForm.agreeToTerms.checked;

            if (password !== confirmPassword) {
                errorMessage.textContent = 'パスワードが一致しません。';
                return;
            }
            if (password.length < 6) {
                errorMessage.textContent = 'パスワードは6文字以上で入力してください。';
                return;
            }
            if (!agreeToTerms) {
                errorMessage.textContent = '利用規約とプライバシーポリシーへの同意が必要です。';
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: userCredential.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                infoMessage.textContent = '登録が完了しました。ダッシュボードに移動します。';
                infoMessage.style.display = 'block';
                
                setTimeout(() => {
                    // onAuthStateChangedによって自動的にリダイレクトされる
                }, 2000);

            } catch (error) {
                console.error("新規登録エラー:", error);
                errorMessage.textContent = `新規登録に失敗しました: ${error.message}`;
            }
        });
    }

    // ダッシュボード機能 (dashboard.html)
    // ここにダッシュボード専用のロジックを追加
    if (document.body.classList.contains('dashboard-page')) {
        // 例: 統計データの更新
        updateStats();

        // ゲストモードでの投稿ボタン無効化など
        const reportButtons = document.querySelectorAll('.cta-button, .floating-button.primary');
        if (!auth.currentUser) {
            reportButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('投稿するにはログインが必要です。');
                    window.location.href = 'index.html';
                });
            });
        }
    }

    // ダッシュボードのログアウト処理
    if (dashboardLogoutButton) {
        dashboardLogoutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                alert('ログアウトしました。');
                window.location.href = 'index.html';
            } catch (error) {
                console.error("ログアウトエラー:", error);
                alert(`ログアウトに失敗しました: ${error.message}`);
            }
        });
    }
});

// 以下はダッシュボードの機能関数（dashboard.htmlで使用）

// データ更新（実際の実装では API から取得）
function updateStats() {
    // 統計データの更新
    const stats = {
        totalReports: Math.floor(Math.random() * 50) + 220,
        thisWeek: Math.floor(Math.random() * 10) + 8,
        activeUsers: Math.floor(Math.random() * 20) + 75,
        resolvedIssues: Math.floor(Math.random() * 30) + 140
    };

    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

function reportDanger() {
    // ログインユーザーのみ投稿可能
    if (!auth.currentUser) {
        alert('危険を報告するにはログインが必要です。');
        window.location.href = 'index.html';
        return;
    }

    // 位置情報取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log('現在位置:', position.coords.latitude, position.coords.longitude);
            alert('危険情報の投稿画面を開きます\n現在位置: ' + position.coords.latitude.toFixed(4) + ', ' + position.coords.longitude.toFixed(4));
            // ここで投稿フォームページに遷移
        }, function(error) {
            console.log('位置情報の取得に失敗:', error);
            alert('危険情報の投稿画面を開きます');
            // 位置情報なしでも投稿可能
        });
    } else {
        alert('危険情報の投稿画面を開きます');
    }
}

function viewMap() {
    console.log('マップを表示します');
    alert('危険情報マップを表示します');
    // ここでマップページに遷移
}

function openFullMap() {
    console.log('詳細マップを開きます');
    alert('詳細マップを表示します');
    // ここで詳細マップページに遷移
}

function filterByType(type) {
    console.log(`${type}の危険情報でフィルタリングします`);
    alert(`${type}の危険情報を表示します`);
    // ここでフィルタリングされた一覧ページに遷移
}

function viewReport(reportId) {
    console.log(`報告 ${reportId} の詳細を表示します`);
    alert(`報告の詳細を表示します: ${reportId}`);
    // ここで個別の報告詳細ページに遷移
}