import TinyLru, {Lru} from '../tiny-lru'
import {expectType} from "tsd";

const lru = TinyLru(20, 100)

expectType<Lru>(lru);
