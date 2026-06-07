import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export async function GET(request) {
  try {
    const dolarPyRes = await fetch('https://dolar.melizeche.com/api/1.0/');
    const dolarPyData = await dolarPyRes.json();
    const chacoRates = dolarPyData.dolarpy.cambioschaco;
    
    const awesomeRes = await fetch('https://economia.awesomeapi.com.br/json/last/BRL-PYG');
    const awesomeData = await awesomeRes.json();
    const brlPyg = awesomeData.BRLPYG;

    const ratesToInsert = [
      { currency_pair: 'USD_PYG', rate_buy: chacoRates.compra, rate_sell: chacoRates.venta, source: 'Cambios Chaco' },
      { currency_pair: 'BRL_PYG', rate_buy: brlPyg.bid, rate_sell: brlPyg.ask, source: 'AwesomeAPI' }
    ];

    const { error } = await supabase.from('exchange_rates').insert(ratesToInsert);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Câmbio atualizado no Absoluta SOF!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}