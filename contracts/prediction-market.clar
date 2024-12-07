;; prediction-market contract

(define-map markets
  uint
  {
    creator: principal,
    meme-id: uint,
    end-height: uint,
    total-yes: uint,
    total-no: uint,
    resolved: bool,
    outcome: (optional bool)
  }
)

(define-map user-predictions
  { market-id: uint, user: principal }
  { prediction: bool, amount: uint }
)

(define-data-var last-market-id uint u0)

(define-constant err-market-closed (err u100))
(define-constant err-market-not-resolved (err u101))
(define-constant err-market-already-resolved (err u102))

(define-public (create-market (meme-id uint) (duration uint))
  (let
    (
      (market-id (+ (var-get last-market-id) u1))
    )
    (map-set markets market-id {
      creator: tx-sender,
      meme-id: meme-id,
      end-height: (+ block-height duration),
      total-yes: u0,
      total-no: u0,
      resolved: false,
      outcome: none
    })
    (var-set last-market-id market-id)
    (ok market-id)
  )
)

(define-public (predict (market-id uint) (prediction bool) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets market-id) (err u404)))
    )
    (asserts! (< block-height (get end-height market)) err-market-closed)
    (map-set user-predictions { market-id: market-id, user: tx-sender } { prediction: prediction, amount: amount })
    (map-set markets market-id
      (merge market
        {
          total-yes: (if prediction (+ (get total-yes market) amount) (get total-yes market)),
          total-no: (if prediction (get total-no market) (+ (get total-no market) amount))
        }
      )
    )
    (ok true)
  )
)

(define-public (resolve-market (market-id uint) (outcome bool))
  (let
    (
      (market (unwrap! (map-get? markets market-id) (err u404)))
    )
    (asserts! (>= block-height (get end-height market)) err-market-not-resolved)
    (asserts! (not (get resolved market)) err-market-already-resolved)
    (map-set markets market-id
      (merge market
        {
          resolved: true,
          outcome: (some outcome)
        }
      )
    )
    (ok true)
  )
)

(define-read-only (get-market (market-id uint))
  (map-get? markets market-id)
)

(define-read-only (get-prediction (market-id uint) (user principal))
  (map-get? user-predictions { market-id: market-id, user: user })
)

