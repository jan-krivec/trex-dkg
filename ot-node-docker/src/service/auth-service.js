import ipLib from 'ip';
import jwtUtil from './util/jwt-util.js';

class AuthService {
    constructor(ctx) {
        this._authConfig = ctx.config.auth;
        this._repository = ctx.repositoryModuleManager;
        this._logger = ctx.logger;
    }

    /**
     * Authenticate users based on provided ip and token
     * @param ip
     * @param token
     * @returns {boolean}
     */
    async authenticate(ip, token) {
        const isWhitelisted = this._isIpWhitelisted(ip);
        const isTokenValid = await this._isTokenValid(token);

        const tokenAuthEnabled = this._authConfig.tokenBasedAuthEnabled;
        const ipAuthEnabled = this._authConfig.ipBasedAuthEnabled;
        const requiresBoth = this._authConfig.bothIpAndTokenAuthRequired;

        let isAuthenticated = false;
        if (tokenAuthEnabled && ipAuthEnabled) {
            isAuthenticated = requiresBoth
                ? isWhitelisted && isTokenValid
                : isWhitelisted || isTokenValid;
        } else {
            isAuthenticated = isWhitelisted && isTokenValid;
        }

        if (!isAuthenticated) {
            this._logMessage('Received unauthenticated request.');
        }

        return isAuthenticated;
    }

    /**
     * Checks whether user whose token is provided has abilities for system operation
     * @param token
     * @param systemOperation
     * @returns {Promise<boolean|*>}
     */
    async isAuthorized(token, systemOperation) {
        if (!this._authConfig.tokenBasedAuthEnabled) {
            return true;
        }

        /* 
            If IP is whitelisted and both IP and Token Auth is NOT required pass authorization check.
            Authentication middleware checks if IP is white listed before authorization middleware.
        */
        if (!(await this._isTokenValid(token))) {
            if (
                !this._authConfig.bothIpAndTokenAuthRequired &&
                this._authConfig.ipBasedAuthEnabled
            ) {
                return true;
            }
            return false;
        }

        const tokenId = jwtUtil.getPayload(token).jti;
        const abilities = await this._repository.getTokenAbilities(tokenId);

        const isAuthorized = abilities.includes(systemOperation);

        const logMessage = isAuthorized
            ? `Token ${tokenId} is successfully authenticated and authorized.`
            : `Received unauthorized request.`;

        this._logMessage(logMessage);

        return isAuthorized;
    }

    /**
     * Determines whether operation is listed in config.auth.publicOperations
     * @param operationName
     * @returns {boolean}
     */
    isPublicOperation(operationName) {
        if (!Array.isArray(this._authConfig.publicOperations)) {
            return false;
        }

        return this._authConfig.publicOperations.some(
            (publicOperation) =>
                publicOperation === `V0/${operationName}` || publicOperation === operationName,
        );
    }

    /**
     * Validates token structure and revoked status
     * If ot-node is configured not to do a token based auth, it will return true
     * @param token
     * @returns {boolean}
     * @private
     */
    async _isTokenValid(token) {
        if (!this._authConfig.tokenBasedAuthEnabled) {
            return true;
        }

        if (!token) {
            return false;
        }

        if (!jwtUtil.validateJWT(token)) {
            return false;
        }

        const isRevoked = await this._isTokenRevoked(token);

        return isRevoked !== null && !isRevoked;
    }

    normalizeIp(ip) {
        if (ipLib.isV4Format(ip)) return ip; // IPv4
        if (ipLib.isV6Format(ip) && ip.startsWith('::ffff:')) {
            return ipLib.toString(ipLib.toBuffer(ip).slice(-4)); // Extract IPv4 from mapped IPv6
        }
        return ip; // Return as-is for pure IPv6
    };

    /**
     * Checks whether provided ip is whitelisted in config
     * Returns false if ip based auth is disabled
     * @param ip
     * @returns {boolean}
     * @private
     */
    _isIpWhitelisted(reqIp) {
        if (!this._authConfig.ipBasedAuthEnabled) {
            return true;
        }

        for (const whitelistedIp of this._authConfig.ipWhitelist) {
            let isEqual = false;

            try {
                if (whitelistedIp.includes('/')) {
                    const ip = this.normalizeIp(reqIp);
                    const subnet = ipLib.cidrSubnet(whitelistedIp);
                    isEqual = subnet.contains(ip);
                } else {
                    // For individual IP addresses
                    isEqual = ipLib.isEqual(reqIp, whitelistedIp);
                }
            } catch (e) {
                // if ip is not valid IP isEqual should remain false
            }

            if (isEqual) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether provided token is revoked
     * Returns false if token based auth is disabled
     * @param token
     * @returns {Promise<boolean|*>|boolean}
     * @private
     */
    _isTokenRevoked(token) {
        if (!this._authConfig.tokenBasedAuthEnabled) {
            return false;
        }

        const tokenId = jwtUtil.getPayload(token).jti;

        return this._repository.isTokenRevoked(tokenId);
    }

    /**
     * Logs message if loggingEnabled is set to true
     * @param message
     * @private
     */
    _logMessage(message) {
        if (this._authConfig.loggingEnabled) {
            this._logger.info(`[AUTH] ${message}`);
        }
    }
}

export default AuthService;
