-- 029: Permanently prohibit short selling. Exchange approval cannot override holdings checks.
DO $short_sell_fix$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_exchange_decide(jsonb,jsonb)'::regprocedure);
  v_old := $old$      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'SHORT SELLING: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Normal participant short selling is prohibited. Approve it explicitly only as an Exchange override — it is recorded as SHORT SELLING — EXCHANGE APPROVED and the Bank still rejects it unless the holding is sufficient at settlement.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', jse_team_side(o.account_type, o.side), o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_APPROVED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
          jsonb_build_object('holding', v_avail.holding, 'quantity', o.quantity, 'open_sell_other', v_avail.open_sell, 'account_type', o.account_type));
      END IF;$old$;
  v_new := $new$      IF o.quantity > greatest(v_avail.available, 0) THEN
        RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELLING_NOT_ALLOWED', HINT = '409',
          MESSAGE = 'SHORT SELLING PROHIBITED: ' || coalesce((SELECT code FROM teams WHERE id = o.team_id), 'team') || ' cannot sell more shares than it owns. Available to sell: ' ||
                    greatest(v_avail.available, 0) || ' (holding ' || v_avail.holding || ', other open sell orders ' || v_avail.open_sell || '). Reject this order or reduce its quantity.';
      END IF;$new$;
  IF position(v_old IN v_fn) = 0 THEN
    RAISE EXCEPTION '029: expected Exchange short-selling override block not found';
  END IF;
  v_fn := replace(v_fn, v_old, v_new);
  v_fn := regexp_replace(v_fn, '  v_confirm boolean := [^;]*;' || chr(10), '');
  v_fn := replace(v_fn, '    -- The Exchange may explicitly approve it (recorded as SHORT SELLING — EXCHANGE APPROVED); the Bank still' || chr(10) ||
                  '    -- checks the holding at settlement. Institutions have no cash or holdings restriction.' || chr(10),
                  '    -- Short selling is prohibited at every stage; institutional accounts have no independent holdings.' || chr(10));
  IF position('SHORT SELLING — EXCHANGE APPROVED' IN v_fn) > 0 OR position('confirm_short_sell' IN v_fn) > 0 THEN
    RAISE EXCEPTION '029: Exchange override still present after replacement';
  END IF;
  EXECUTE v_fn;
END
$short_sell_fix$;
INSERT INTO schema_migrations(version) VALUES ('029_no_short_selling_override')
ON CONFLICT (version) DO NOTHING;
