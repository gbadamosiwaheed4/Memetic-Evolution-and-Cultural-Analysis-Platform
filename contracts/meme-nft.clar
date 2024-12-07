;; meme-nft contract

(define-non-fungible-token meme uint)

(define-data-var last-token-id uint u0)

(define-map meme-data
  uint
  {
    creator: principal,
    content-hash: (buff 32),
    created-at: uint,
    remixed-from: (optional uint)
  }
)

(define-public (mint (content-hash (buff 32)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (try! (nft-mint? meme token-id tx-sender))
    (map-set meme-data token-id {
      creator: tx-sender,
      content-hash: content-hash,
      created-at: block-height,
      remixed-from: none
    })
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (remix (original-id uint) (new-content-hash (buff 32)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (is-some (nft-get-owner? meme original-id)) (err u404))
    (try! (nft-mint? meme token-id tx-sender))
    (map-set meme-data token-id {
      creator: tx-sender,
      content-hash: new-content-hash,
      created-at: block-height,
      remixed-from: (some original-id)
    })
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-read-only (get-meme-data (token-id uint))
  (map-get? meme-data token-id)
)

