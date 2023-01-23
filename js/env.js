class MOLE_ENV {
    static port = "5555";
    static local_host = "ws://localhost:" + this.port;
    static remote_host = "wss://molechess.com/server";
    static host = this.local_host;
}