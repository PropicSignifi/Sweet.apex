public class Inject {
    @inject
    private Case c1;

    @inject('demo')
    private Case c2;

    @inject(name='demo')
    private Case c3;
}
